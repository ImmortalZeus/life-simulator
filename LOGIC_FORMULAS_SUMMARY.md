# Strive & Thrive — Core Logic, Formulas, & Implementation Index

This document summarizes the mathematical formulas, probability distributions, state calculations, and game-event logic implemented in the Strive & Thrive simulation codebase. Use this index to debug the logic and trace calculations to their exact files and line numbers.

---

## 1. Income Formulas

Income is processed on an annual basis at the end of each round, but displayed as monthly equivalents in the UI.

### 1.1 Main Job Salary
- **Formula:** 
  $$\text{Main Job Annual Salary} = \text{Monthly Salary} \times 12$$
- **Details:** The monthly salary scales round-by-round from 15,000,000 VND to 45,000,000 VND. To support liquid mid-round transactions, the entire annual main job salary is added to cash at the start of each round.
- **Implementation:**
  - `ROUNDS` configurations: [js/data.js:L20-L26](./js/data.js#L20-L26)
  - Added to cash at round start: [js/game.js:L288-L290](./js/game.js#L288-L290)
  - Offset in round-end calculations: [js/health.js:L281-L282](./js/health.js#L281-L282)

### 1.2 Overtime (OT) Wages
- **Formula:**
  $$\text{OT Hourly Wage} = \left( \frac{\text{Monthly Salary}}{208} \right) \times 1.5$$
  $$\text{Annual OT Wages} = \text{OT Hourly Wage} \times \text{OT Hours} \times 12$$
- **Details:** 208 represents the standard working hours in a month (26 days $\times$ 8 hours). OT hours can be set to $0, 10, 20, 30,$ or $40$ hours.
- **Implementation:**
  - OTWage function: [js/data.js:L29-L31](./js/data.js#L29-L31)
  - Calculation: [js/health.js:L40-L43](./js/health.js#L40-L43)

### 1.3 Side Job Wages
- **Formula:**
  $$\text{Annual Side Job Wages} = \text{Side Job Hourly Wage} \times \text{Side Job Hours} \times 12$$
- **Details:** Side job choices are: Bookkeeper (60,248 VND/hr), Adviser (116,476 VND/hr), Tutor (137,924 VND/hr), Blogger (157,785 VND/hr). Maximum choice of one side job, up to 40 hours.
- **Implementation:**
  - `SIDE_JOBS` definitions: [js/data.js:L40-L46](./js/data.js#L40-L46)
  - Calculation: [js/health.js:L45-L48](./js/health.js#L45-L48)

### 1.4 Savings Interest
- **Formula:**
  $$\text{Interest Earned} = \text{Savings Balance} \times \text{Savings Interest Rate}$$
- **Details:** The interest rate depends on the savings tier (defined by balance) and cumulative branch-based macroeconomic adjustments:
  - **Normal** ($\ge$ 1M): $6.5\%$
  - **Inspire** ($\ge$ 1B): $6.75\%$
  - **Priority** ($\ge$ 3B): $6.8\%$
  - **Private** ($\ge$ 5B): $6.9\%$
- **Implementation:**
  - `SAVINGS_TIERS` & rate lookup: [js/data.js:L122-L149](./js/data.js#L122-L149)
  - Calculation: [js/health.js:L50-L52](./js/health.js#L50-L52)

---

## 2. Expense Formulas

### 2.1 Inflation Adjustment
- **Formula:**
  $$\text{Adjusted Monthly Category Cost} = \text{Monthly Category Budget} \times (1 + \text{Inflation Rate})$$
  $$\text{Total Annual Expenses} = \left( \sum \text{Adjusted Monthly Category Costs} \right) \times 12 + \text{Annual Insurance Fee}$$
- **Details:** The inflation rate increases cumulatively based on the macroeconomic event branches. 
- **Implementation:**
  - Expense calculation: [js/health.js:L80-L94](./js/health.js#L80-L94)

### 2.2 Liberty WorldCare Insurance Fee
- **Formula:**
  - Rounds 1-3: 24,056,000 VND annually
  - Rounds 4-5: 27,840,000 VND annually
- **Implementation:**
  - `getInsuranceFee`: [js/data.js:L114-L116](./js/data.js#L114-L116)
  - Expense calculation: [js/health.js:L252-L253](./js/health.js#L252-L253)

---

## 3. Stock Transactions & Portfolio Valuations

Stock trades incur transaction fees and capital taxes. Portfolio calculations utilize the average cost basis.

### 3.1 Stock Buying Cost
- **Formula:**
  $$\text{Subtotal} = \text{Quantity} \times \text{Stock Price}$$
  $$\text{Trading Fee} = \text{Subtotal} \times 0.15\%$$
  $$\text{Total Buy Cost} = \text{Subtotal} + \text{Trading Fee}$$
- **Implementation:**
  - Buy listener: [js/game.js:L1248-L1256](./js/game.js#L1248-L1256)

### 3.2 Stock Selling Proceeds
- **Formula:**
  $$\text{Subtotal} = \text{Quantity} \times \text{Stock Price}$$
  $$\text{Trading Fee} = \text{Subtotal} \times 0.15\%$$
  $$\text{Sell Tax} = \text{Subtotal} \times 0.10\%$$
  $$\text{Net Proceeds} = \text{Subtotal} - \text{Trading Fee} - \text{Sell Tax}$$
- **Implementation:**
  - Sell listener: [js/game.js:L1299-L1305](./js/game.js#L1299-L1305)

### 3.3 Average Cost Basis (`avgCost`)
- **Formula:**
  $$\text{newAvgCost} = \frac{(\text{pos.avgCost} \times \text{pos.quantity}) + \text{Total Buy Cost}}{\text{newQty}}$$
- **Implementation:**
  - Buy handler: [js/game.js:L1264](./js/game.js#L1264)

### 3.4 Portfolio Market Valuation
- **Formula:**
  $$\text{Portfolio Market Value} = \sum \left( \text{Quantity} \times \text{Market Price} \times (1 + 0.15\%) \right)$$
- **Details:** Multiplies stock positions by the market price and includes the buying trading fee ($0.15\%$) to represent the true cost basis value in Net Worth projections.
- **Implementation:**
  - Valuation: [js/health.js:L391-L397](./js/health.js#L391-L397)

---

## 4. Well-being (Health) Delta Formulas

Physical and mental health deltas are computed at the end of each round.

### 4.1 Income-Based Health Penalty
- **Formula:**
  $$\text{Income Penalty} = \text{BASE_HEALTH_LOSS} \times \text{Quintile Multiplier}$$
- **Details:** 
  - $\text{BASE_HEALTH_LOSS} = \frac{25}{12} \approx 2.083$ (monthly penalty, meaning 25 points annually).
  - Income quintiles are checked against round-specific boundaries (`GAME_DATA.INCOME_QUINTILES`).
  - **Mental Health Multipliers:** Q1 (lowest): $1.4$, Q2: $1.15$, Q3: $1.0$, Q4: $0.85$, Q5 (highest): $0.7$.
  - **Physical Health Multipliers:** Q1: $1.2$, Q2: $1.1$, Q3: $1.0$, Q4: $0.9$, Q5: $0.8$.
- **Implementation:**
  - Breakpoints & lookup: [js/data.js:L201-L290](./js/data.js#L201-L290)
  - MH Penalty: [js/health.js:L124-L127](./js/health.js#L124-L127)
  - PH Penalty: [js/health.js:L185-L188](./js/health.js#L185-L188)

### 4.2 Overtime & Side Job Work Penalty
- **Formulas:**
  $$\text{MH Work Penalty} = 5 \times 0.048 \times \text{OT Hours} + 5 \times 0.048 \times \text{Side Job Hours} \times \text{Side Job MH Multiplier}$$
  $$\text{PH Work Penalty} = 5 \times 0.034 \times \text{OT Hours} + 5 \times 0.034 \times \text{Side Job Hours} \times \text{Side Job PH Multiplier}$$
- **MH Job Multipliers:** none: $0.0$, adviser: $1.0$, tutor: $1.03$, bookkeeper: $1.04$, blogger: $1.14$.
- **PH Job Multipliers:** none: $0.0$, adviser: $1.0$, bookkeeper: $1.03$, blogger: $1.10$, tutor: $1.11$.
- **Implementation:**
  - Multipliers: [js/data.js:L48-L62](./js/data.js#L48-L62)
  - MH Work Penalty: [js/health.js:L129-L133](./js/health.js#L129-L133)
  - PH Work Penalty: [js/health.js:L190-L194](./js/health.js#L190-L194)

### 4.3 Expense-Adjusted Mental Health Effect
- **Formula:**
  $$\text{MH Expense Effect} = 15 \times \sum_{i} \left( \text{Coefficient}_i \times (\text{Base Ratio}_i - \text{Actual Ratio}_i) \right)$$
- **Details:** 
  - $\text{Actual Ratio} = \frac{\text{Monthly Category Expense}}{\text{Total Monthly Income}}$.
  - Coefficients ($\text{Coefficient}_i$): housing: $1.0$, food: $0.64$, utility: $0.27$, transport: $0.15$, healthcare: $-0.33$, entertainment: $-0.23$.
  - Base Ratios ($\text{Base Ratio}_i$): housing: $0.25$, food: $0.17$, utility: $0.0467$, transport: $0.0333$, healthcare: $0.0533$, entertainment: $0.3$.
- **Implementation:**
  - Coefficients & Ratios: [js/data.js:L90-L107](./js/data.js#L90-L107)
  - Calculation: [js/health.js:L135-L149](./js/health.js#L135-L149)

### 4.4 Healthcare Spending Physical Health Recovery
- **Formula:**
  - $\text{Annual Spending Ratio} = \frac{\text{Annual Healthcare Spending}}{\text{Annual Income}}$.
  - If $\text{Annual Spending Ratio} < 1\%$: $\text{PH Recovery} = 0$
  - If $\text{Annual Spending Ratio} < 3\%$: $\text{PH Recovery} = 12$
  - If $\text{Annual Spending Ratio} < 6\%$: $\text{PH Recovery} = 22$
  - If $\text{Annual Spending Ratio} \ge 6\%$: $\text{PH Recovery} = 30$
- **Implementation:**
  - Recovery rules: [js/data.js:L1012-L1022](./js/data.js#L1012-L1022)
  - Calculation: [js/health.js:L196-L199](./js/health.js#L196-L199)

---

## 5. Event Selection & Trigger Probability Rules

Start-of-round events are rolled at the beginning of each round (except when health falls into critical states).

### 5.1 Critical Work Restrictions
- **Rule:** If physical health $< 20\%$ or mental health $< 20\%$, no random events, job rewards, or expense penalties are rolled or active for that round.
- **Implementation:** [js/game.js:L318-L325](./js/game.js#L318-L325)

### 5.2 Job-Reward Events
- **Trigger Probability:** Based on overtime hours from the *previous* round:
  - $10$ Hours OT: $20\%$ chance
  - $20$ Hours OT: $50\%$ chance
  - $30$ Hours OT: $80\%$ chance
  - $40$ Hours OT: $100\%$ chance
- **Tier Selection Weights:**
  - **10 Hours OT:** Minor ($70\%$), Moderate ($30\%$)
  - **20 Hours OT:** Minor ($50\%$), Moderate ($50\%$)
  - **30 Hours OT:** Moderate ($50\%$), Major ($50\%$)
  - **40 Hours OT:** Major ($70\%$), Exceptional ($30\%$)
- **Implementation:** [js/game.js:L327-L359](./js/game.js#L327-L359)

### 5.3 Random Events
- **Number of Events rolled:** 
  - $50\%$ chance to roll $3$ events, $50\%$ chance to roll $4$ events.
  - If a job-reward event triggered, this count is reduced by $1$.
- **Rarity Pool Trigger Chance:**
  - Common: $50\%$
  - Uncommon: $25\%$
  - Rare: $15\%$
  - Very Rare: $8\%$
  - Ultra Rare: $2\%$
- **Selection weights:** 
  - Inside a selected rarity pool, events are selected using relative weights (`weight / sum(weights)`).
  - Positive events: $45\%$ chance. Negative events: $55\%$ chance.
- **Implementation:** [js/game.js:L361-L396](./js/game.js#L361-L396)

### 5.4 Expense Penalty Events
- **Rule:** Triggered if any category expense was set to its minimum value in the previous round.
- **Trigger Chance:**
  - housing: exp_housing_1 ($50\%$), exp_housing_2 ($30\%$), exp_housing_3 ($20\%$).
  - food: exp_food_1 ($50\%$), exp_food_2 ($30\%$), exp_food_3 ($20\%$).
  - utility: exp_utility_1 ($50\%$), exp_utility_2 ($30\%$), exp_utility_3 ($20\%$).
  - transport: exp_transport_1 ($50\%$), exp_transport_2 ($30\%$), exp_transport_3 ($20\%$).
  - healthcare: exp_health_1 ($50\%$), exp_health_2 ($30\%$), exp_health_3 ($20\%$).
- **Implementation:** [js/game.js:L398-L424](./js/game.js#L398-L424)

---

## 6. Starting Health Warnings & Bypass System

### 6.1 Trigger thresholds
- Physical Health $< 50\%$ or Mental Health $< 50\%$ at the start of a round.
- **Implementation:** [js/game.js:L502-L576](./js/game.js#L502-L576)

### 6.2 Health Gain Warning Bypass Rule
- **Formula:** 
  $$\text{Bypass Condition} = \text{Health}_\text{current} - \text{Health}_\text{prev} \ge 5$$
  where $\text{Health}_\text{current}$ is the health score before starting events in the active round, and $\text{Health}_\text{prev}$ is the health score before starting events in the previous round.
- **Details:** If this is satisfied, the penalty is bypassed, and the warning event is ignored.
- **Implementation:** 
  - Physical bypass: [js/game.js:L504](./js/game.js#L504)
  - Mental bypass: [js/game.js:L542](./js/game.js#L542)

### 6.3 Consecutive Warning UI Suppression
- **Rule:** If a warning card was shown in the previous round, a consecutive warning of the same type will have `hiddenFromUI = true` (it will not display as a card to prevent visual spam). However, the associated cash and health penalties are still applied.
- **Implementation:** 
  - Physical suppression: [js/game.js:L517-L536](./js/game.js#L517-L536)
  - Mental suppression: [js/game.js:L555-L574](./js/game.js#L555-L574)

### 6.4 Medical Insurance Bypass
- **Rule:** If a health warning or medical expense event includes a cash penalty, purchasing insurance (`state.hasInsurance === true`) cancels out the cash loss.
- **Implementation:** 
  - Physical warning cash penalty bypass: [js/game.js:L512](./js/game.js#L512)
  - Mental warning cash penalty bypass: [js/game.js:L550](./js/game.js#L550)
  - Random/Starting events cash penalty bypass: [js/game.js:L431-L433](./js/game.js#L431-L433)

---

## 7. Dynamic Stock Pricing Algorithm

Stocks price changes update at the end of each round using a customized market factor model.

- **Formula:**
  $$R_{i,t} = R_{market,t} + \gamma \cdot R_{sector,t} + \epsilon_{i,t}$$
  where:
  - $R_{market,t}$ is the market-wide return factor for the active branch.
  - $R_{sector,t}$ is the sector-specific return factor.
  - $\gamma$ is the stock's sensitivity factor (beta) to the sector.
  - $\epsilon_{i,t} \sim \text{Uniform}(-\sigma_{i,t}, \sigma_{i,t})$ is the stock's firm-specific error term (idiosyncratic risk).
  - $\sigma_{i,t} = \sigma_{base} \times m_{scenario,t}$ where $\sigma_{base}$ is the stock's base volatility and $m_{scenario,t}$ is the active scenario multiplier.
- **Implementation:** [js/health.js:L344-L382](./js/health.js#L344-L382)
