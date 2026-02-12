# ⚓️ Lighthouse Finance

Intelligent RSS Monitoring & AI Content Automation for Finance Professionals

---

## 🚀 Overview

**Lighthouse Finance** is an automation tool designed for finance professionals and wealth managers.

It scans official financial RSS feeds (Tax Authorities, AMF, Service-Public, etc.), detects high-impact regulatory updates, and transforms them into ready-to-publish social media content using **Google Gemini 1.5 Flash**.

Each week, users receive:

- 3 high-impact news selections
- Simplified summaries
- Instagram carousel (slide) outlines
- Delivered directly via email

---

## 🎯 Problem

Finance professionals face:

- Information overload
- Scattered regulatory updates
- Time-consuming content creation

Lighthouse filters noise, extracts signal, and converts complex regulation into accessible, engaging social media content.

---

## 🧠 How It Works

### 1️⃣ RSS Monitoring

- Automated scanning of predefined official RSS feeds
- Scheduled execution (cron job or serverless scheduler)
- Source validation to ensure reliability

### 2️⃣ Content Filtering

- Deduplication of articles
- Relevance scoring
- Impact evaluation based on predefined criteria

### 3️⃣ AI Processing (Gemini 1.5 Flash)

For each selected news item:

- Extract key insights
- Generate a simplified summary
- Produce an Instagram carousel structure

### 4️⃣ Weekly Digest

- Select the top 3 most impactful news items
- Format content into structured email
- Send via email service (SendGrid, Resend, Amazon SES, etc.)

---

## 📦 Output Format

Each selected news item generates:

### 📰 Simplified Summary

- What changed
- Who is impacted
- What action to consider

### 📱 Instagram Carousel Outline

Slide structure example:

1. Hook (Attention-grabbing headline)
2. Context (What is happening?)
3. Key Change
4. Who is impacted
5. Practical Consequences
6. Call to Action

### ✉️ Email Delivery

Weekly structured digest including:

- Title
- Summary
- Instagram outline
- Source link

---

## 🏗️ Technical Architecture (Proposed)

```text
RSS Sources
    ↓
RSS Fetcher (Cron / Scheduler)
    ↓
Preprocessing Layer (Deduplication + Scoring)
    ↓
Gemini API (Content Analysis & Generation)
    ↓
Content Formatter
    ↓
Email Service Provider
    ↓
User Inbox
```
