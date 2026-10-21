'use strict';
// Paper titles / groups: ICMAI Syllabus 2022 curriculum pages.
// Chapter outlines and questions below are original, limited demo content.
const COURSE_TEMPLATES=[
 ['5','inter','1','Business Laws and Ethics','Business Laws',['Business agreements','Business ethics','Corporate governance']],
 ['6','inter','1','Financial Accounting','Financial Accounting',['Accounting fundamentals','Depreciation','Financial statements']],
 ['7','inter','1','Direct and Indirect Taxation','Taxation',['Taxation concepts','Income classification','Indirect tax overview']],
 ['8','inter','1','Cost Accounting','Cost Accounting',['Cost classification','Material costs','Overhead allocation']],
 ['9','inter','2','Operations Management and Strategic Management','Operations & Strategy',['Production planning','Inventory management','Strategic analysis']],
 ['10','inter','2','Corporate Accounting and Auditing','Corporate Accounting',['Accounting standards','Financial statements','Audit planning']],
 ['11','inter','2','Financial Management and Business Data Analytics','Finance & Analytics',['Time value of money','Capital budgeting','Business analytics']],
 ['12','inter','2','Management Accounting','Management Accounting',['Marginal costing','Budgetary control','Standard costing']],
 ['13','final','3','Corporate and Economic Laws','Corporate Laws',['Corporate governance','Economic laws overview','Business compliance']],
 ['14','final','3','Strategic Financial Management','Strategic Finance',['Portfolio management','Business valuation','Derivatives']],
 ['15','final','3','Direct Tax Laws and International Taxation','Direct Taxation',['Tax planning concepts','International taxation overview','Transfer pricing overview']],
 ['16','final','3','Strategic Cost Management','Strategic Costing',['Activity based costing','Target costing','Performance measurement']],
 ['17','final','4','Cost and Management Audit','Cost & Management Audit',['Cost audit overview','Management audit','Internal control review']],
 ['18','final','4','Corporate Financial Reporting','Financial Reporting',['Financial reporting concepts','Consolidation basics','Cash flow reporting']],
 ['19','final','4','Indirect Tax Laws and Practice','Indirect Taxation',['Indirect tax framework','Compliance overview','Practice case studies']],
 ['20A','final','4','Strategic Performance Management and Business Valuation','Performance & Valuation',['Performance indicators','Value creation','Business valuation']],
 ['20B','final','4','Risk Management in Banking and Insurance','Banking & Insurance Risk',['Risk identification','Credit risk','Risk mitigation']],
 ['20C','final','4','Entrepreneurship and Startup','Entrepreneurship',['Business models','Customer validation','Startup finance']]
].map(([paper,level,group,name,short,chapters])=>({paper,level,group,name,short,chapters}));
const PAPER_ALIASES={ma:'12',ca:'10',om:'9',fm:'11',sfm:'14',scm:'16'};
function subjectPaper(s){if(s.paper)return s.paper;if(PAPER_ALIASES[s.id])return PAPER_ALIASES[s.id];const normalize=x=>x.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');return COURSE_TEMPLATES.find(t=>normalize(t.name)===normalize(s.name))?.paper||null}
const QUESTION_BANK=[];
function addDemoQuestions(paper,rows){rows.forEach(([topic,prompt,options,answer,explanation],i)=>QUESTION_BANK.push({id:'demo-'+paper+'-'+(i+1),paper,level:parseInt(paper,10)<13?'inter':'final',topic,prompt,options,answer,explanation}))}
addDemoQuestions('12',[
 ['Marginal costing','A product sells for ₹500 and has variable cost of ₹300 per unit. What is the contribution per unit?',['₹100','₹200','₹300','₹800'],1,'Contribution = selling price − variable cost = ₹500 − ₹300 = ₹200 per unit.'],
 ['Cost-volume-profit analysis','Fixed costs are ₹60,000 and contribution is ₹150 per unit. What is the break-even quantity?',['300 units','400 units','450 units','600 units'],1,'Break-even units = fixed costs ÷ contribution per unit = 60,000 ÷ 150 = 400 units.'],
 ['Budgetary control','Which budget adjusts the budgeted cost for the actual level of activity?',['Fixed budget','Cash budget','Flexible budget','Sales forecast'],2,'A flexible budget adjusts for the activity level, allowing a more meaningful comparison with actual costs.'],
 ['Standard costing','Standard price is ₹10 per kg. Actual price is ₹12 per kg for 100 kg purchased. What is the material price variance?',['₹200 favourable','₹200 adverse','₹1,000 adverse','₹1,200 favourable'],1,'Price variance = (standard price − actual price) × actual quantity = (10 − 12) × 100 = −₹200, an adverse variance.']
]);
addDemoQuestions('11',[
 ['Time value of money','What is the future value of ₹1,000 invested for one year at 10% interest?',['₹900','₹1,000','₹1,100','₹1,210'],2,'Future value = ₹1,000 × 1.10 = ₹1,100 for one year.'],
 ['Capital budgeting','A project requires ₹10,000 today. The present value of its future cash inflows is ₹12,500. What is its NPV?',['−₹2,500','₹2,500','₹10,000','₹22,500'],1,'NPV = present value of future cash inflows − initial investment = ₹12,500 − ₹10,000 = ₹2,500.'],
 ['Working capital','Current assets are ₹80,000 and current liabilities are ₹50,000. What is net working capital?',['₹30,000','₹50,000','₹80,000','₹1,30,000'],0,'Net working capital = current assets − current liabilities = ₹30,000.'],
 ['Business analytics','What is the arithmetic mean of 4, 6, 8 and 10?',['6','7','8','9'],1,'Mean = (4 + 6 + 8 + 10) ÷ 4 = 28 ÷ 4 = 7.']
]);
addDemoQuestions('10',[
 ['Financial statements','Which statement reports cash inflows and cash outflows during a period?',['Balance sheet','Cash flow statement','Trial balance','Statement of changes in equity'],1,'The cash flow statement classifies cash flows into operating, investing and financing activities.'],
 ['Audit planning','Why does an auditor assess the risk of material misstatement?',['To guarantee every error is found','To plan the nature, timing and extent of audit procedures','To set product prices','To replace management'],1,'Risk assessment helps the auditor plan appropriate audit procedures. An audit does not guarantee that every error will be found.'],
 ['Internal controls','Which practice helps reduce the risk of misuse of cash?',['One person handles and approves every payment','No bank reconciliations','Separating payment approval from cash handling','Sharing all passwords'],2,'Separating incompatible duties reduces opportunities for a single individual to make and conceal improper transactions.'],
 ['Accounting standards','Under accrual accounting, revenue is generally recognised when earned rather than solely when which event occurs?',['Cash is received','A budget is prepared','A bank account opens','A forecast changes'],0,'Accrual accounting records the economic event when the applicable recognition conditions are met, rather than relying only on cash receipt.']
]);
addDemoQuestions('9',[
 ['Inventory management','What does the basic economic order quantity model balance?',['Selling price and profit','Ordering cost and inventory holding cost','Tax and interest','Revenue and fixed assets'],1,'The basic EOQ model balances ordering costs against inventory holding costs to minimise their total.'],
 ['Production planning','Which resource typically constrains the maximum output of a process?',['The fastest operation','The bottleneck','The largest storage room','The newest machine regardless of capacity'],1,'A bottleneck is the stage with limiting effective capacity and constrains the output of the overall process.'],
 ['Strategic analysis','In SWOT analysis, which item is an external factor?',['Employee skill','Internal process efficiency','A new competitor entering the market','Owned machinery'],2,'Opportunities and threats are external. A new competitor is a possible external threat.'],
 ['Quality management','What is the main purpose of continuous improvement?',['Eliminate all measurement','Make ongoing improvements to processes','Inspect only at year end','Increase defects'],1,'Continuous improvement seeks repeated, incremental improvements to processes, quality and performance.']
]);
addDemoQuestions('6',[
 ['Accounting fundamentals','Which equation expresses the basic accounting relationship?',['Assets = Liabilities + Equity','Assets = Revenue + Expenses','Equity = Assets + Liabilities','Liabilities = Assets + Equity'],0,'The basic accounting equation is assets = liabilities + owners’ equity.'],
 ['Depreciation','An asset costs ₹50,000, has residual value ₹5,000 and a useful life of 5 years. What is annual straight-line depreciation?',['₹5,000','₹9,000','₹10,000','₹11,000'],1,'Annual straight-line depreciation = (50,000 − 5,000) ÷ 5 = ₹9,000.'],
 ['Financial statements','Which financial statement presents assets, liabilities and equity at a specific date?',['Cash flow statement','Income statement','Balance sheet','Sales budget'],2,'A balance sheet presents the financial position at a specific date.'],
 ['Accounting fundamentals','An owner contributes ₹20,000 cash to a business. What is the immediate effect?',['Assets and equity each increase ₹20,000','Assets and liabilities each decrease ₹20,000','Only revenue increases','Only expenses increase'],0,'Cash increases assets and the owner’s contribution increases equity by the same amount.']
]);
addDemoQuestions('8',[
 ['Cost classification','Which is normally a direct material cost for a wooden furniture manufacturer?',['Office rent','Wood used in a table','Factory security','Marketing fees'],1,'Wood incorporated into the table can be directly traced to the product and is a direct material cost.'],
 ['Material costs','Opening material stock is ₹5,000, purchases ₹20,000 and closing stock ₹4,000. What is material consumed?',['₹19,000','₹21,000','₹25,000','₹29,000'],1,'Material consumed = opening stock + purchases − closing stock = ₹5,000 + ₹20,000 − ₹4,000 = ₹21,000.'],
 ['Overhead allocation','Budgeted overhead is ₹90,000 and budgeted machine hours are 3,000. What is the overhead absorption rate?',['₹3 per hour','₹30 per hour','₹90 per hour','₹300 per hour'],1,'Overhead rate = budgeted overhead ÷ budgeted machine hours = ₹90,000 ÷ 3,000 = ₹30 per machine hour.'],
 ['Cost classification','Within the relevant range, total fixed cost normally does what as output increases?',['Stays constant','Increases at the same rate as units','Falls to zero','Equals variable cost'],0,'Within a defined relevant range, total fixed cost is constant, while fixed cost per unit falls as output rises.']
]);
addDemoQuestions('14',[
 ['Portfolio management','What risk can diversification across imperfectly correlated assets generally reduce?',['All market risk','Unsystematic risk','Every investment risk to zero','Inflation in every economy'],1,'Diversification can reduce asset-specific, or unsystematic, risk. It does not eliminate systematic market risk.'],
 ['Business valuation','Free cash flow of ₹100 is expected one year from now. At a 10% discount rate, what is its present value, rounded to two decimals?',['₹90.00','₹90.91','₹100.00','₹110.00'],1,'Present value = ₹100 ÷ 1.10 = ₹90.91.'],
 ['Derivatives','A call option gives its holder which right?',['To sell an asset at the strike price','To buy an asset at the strike price','To receive guaranteed profit','To avoid paying an option premium'],1,'A call gives the holder the right, but not an obligation, to buy the underlying asset at the specified strike price under the contract’s terms.'],
 ['Portfolio management','A portfolio invests equally in assets with expected returns of 8% and 12%. What is its expected return?',['8%','10%','12%','20%'],1,'Expected portfolio return = 0.5 × 8% + 0.5 × 12% = 10%.']
]);
addDemoQuestions('16',[
 ['Activity based costing','In activity-based costing, what is used to assign an activity’s cost to products?',['Only sales value','An appropriate cost driver','Only product weight','Always direct labour hours'],1,'ABC uses cost drivers that reflect products’ consumption of each activity. The driver depends on the activity.'],
 ['Target costing','Expected selling price is ₹1,000 and desired profit is ₹200 per unit. What is target cost?',['₹200','₹800','₹1,000','₹1,200'],1,'Target cost = expected selling price − desired profit = ₹1,000 − ₹200 = ₹800.'],
 ['Performance measurement','Profit is ₹40,000 and capital employed is ₹2,00,000. What is return on investment?',['5%','10%','20%','50%'],2,'ROI = profit ÷ capital employed × 100 = 40,000 ÷ 2,00,000 × 100 = 20%.'],
 ['Decision analysis','Which cost is normally irrelevant to a future choice because it has already been incurred and cannot be recovered?',['Incremental cost','Opportunity cost','Avoidable cost','Sunk cost'],3,'A sunk cost cannot be changed by the future decision and is normally excluded from relevant-cost comparisons.']
]);
addDemoQuestions('18',[
 ['Cash flow reporting','Cash paid to purchase equipment is generally presented in which cash flow category?',['Operating','Investing','Financing','No category'],1,'Purchasing long-term productive equipment is generally an investing cash outflow.'],
 ['Consolidation basics','Why are intragroup balances eliminated on consolidation?',['To present the group as a single economic entity','To remove all liabilities','To guarantee a profit','To ignore external creditors'],0,'Consolidation presents the group as a single economic entity, so balances between group entities are eliminated.']
]);
addDemoQuestions('20A',[
 ['Performance indicators','Which is a non-financial performance indicator?',['Net profit margin','Return on capital','Customer complaint rate','Earnings per share'],2,'Customer complaint rate measures a non-financial aspect of performance such as service or product quality.'],
 ['Business valuation','A perpetuity pays ₹100 annually starting one year from now. At 10%, what is its value?',['₹100','₹500','₹1,000','₹10,000'],2,'For a level perpetuity, value = annual cash flow ÷ discount rate = ₹100 ÷ 0.10 = ₹1,000.']
]);
addDemoQuestions('20B',[
 ['Credit risk','Credit risk is primarily the risk that a borrower will do what?',['Repay earlier than planned','Fail to meet contractual payment obligations','Save more money','Choose a shorter loan term'],1,'Credit risk concerns loss from a counterparty failing to meet its contractual obligations.'],
 ['Risk mitigation','Why might an insurer diversify its portfolio across many independent exposures?',['To pool risks and reduce concentration','To eliminate every possible loss','To stop collecting premiums','To guarantee no claims'],0,'Pooling many independent exposures can reduce concentration and make aggregate outcomes more predictable; it cannot eliminate every loss.']
]);
addDemoQuestions('20C',[
 ['Customer validation','What is the main purpose of testing a minimum viable product?',['To test assumptions with real users','To build every possible feature first','To guarantee profitability','To avoid all feedback'],0,'An MVP is used to learn about key customer and product assumptions with a limited initial offering.'],
 ['Startup finance','A startup has ₹6,00,000 cash and a net cash burn of ₹1,00,000 per month. What is its runway, assuming the burn rate is unchanged?',['3 months','6 months','10 months','12 months'],1,'Runway = available cash ÷ monthly net cash burn = ₹6,00,000 ÷ ₹1,00,000 = 6 months.']
]);
