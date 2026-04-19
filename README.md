# ⚓️ Lighthouse Finance


**Intelligent RSS Monitoring & AI Content Automation for Finance Professionals**



## 🚀 Overview

**Lighthouse Finance** is a cutting-edge automation tool designed for Wealth Managers and Financial Advisors.

The system monitors official and specialized RSS feeds (BOFIP, AMF, Cryptoast, Le Monde, etc.), identifies high-impact regulatory or economic updates, and transforms them into actionable content using **Google Gemini 3 Flash**.

**Every Monday at 08:00 AM**, subscribers receive a structured newsletter including:

- **Top 3 Finance Picks**: Expert summaries, simplified angles, and practical advice.
- **Real Estate Brief**: The most significant property market news of the week.
- **Tech/Crypto Corner**: Monitoring digital markets and upcoming regulations.
- **Instagram Scripts**: A 4-slide carousel plan for each topic, ready for social media publishing.


## 🎯 The Problem
Finance professionals face:

- Regulatory and media **information overload**.
- Scattered information sources.
- A lack of time to convert technical monitoring into engaging content for their clients.

Lighthouse filters the noise, extracts the signal, and converts technical complexity into communication opportunities.



## 🏗️ Technical Architecture (Serverless)

Lighthouse is built on a modern and robust AWS infrastructure:

- **Runtime**: Node.js 20.x (ES Modules)
- **AI Engine**: Google Generative AI (Gemini 3 Flash)
- **Infrastructure**: AWS Lambda & Amazon EventBridge (Cron)
- **Email Design**: MJML Framework
- **Delivery**: Nodemailer (via secure SMTP)




## ⚙️ Configuration (Environment Variables)

| Variable         | Description                        |
| :--------------- | :--------------------------------- |
| `GEMINI_API_KEY` | API Key to access Google Gemini    |
| `EMAIL_HOST`     | SMTP Server (e.g., smtp.gmail.com) |
| `EMAIL_USER`     | Email login ID                     |
| `EMAIL_PASS`     | App Password (SMTP)                |
| `EMAIL_TO`       | Recipients (comma-separated)       |

---

## 🛠 Customize it your way

Lighthouse is built to be modular. Here is how you can adapt it:

### 1. Change the Sources (RSS Feeds)
Edit the `src/config/feeds.js` file to add or remove sources.
- Ensure you stick to the categories (`FINANCE`, `IMMO`, `TECH`) or define new ones.

### 2. Tweak the Email Design
The design uses **MJML**. To change colors, fonts, or branding:
- Modify `src/services/newsletter.js`.
- If you change the structure, remember to update the Regex in the `formatContent` function.

### 3. Adjust the AI's "Tone of Voice"
Need a more formal or more casual tone?
- Update the `prompt` variable in `src/services/aiService.js`.
- You can change instructions like "Tutoies-là" (informal) to "Vouvoies le lecteur" (formal).

### 4. Delivery Frequency
On AWS, update the Cron expression in **EventBridge**:
- `cron(0 7 ? * MON *)` -> Monday 8 AM
- `cron(0 17 ? * FRI *)` -> Friday 6 PM



--- 
_© 2026 • Lighthouse Finance AI • Built by SlowFocus_
