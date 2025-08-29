# Private Lighthouse Automation

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Folder Structure](#folder-structure)
- [Running Scripts](#running-scripts)
- [Scheduled Reports (GitHub Actions)](#scheduled-reports-github-actions)
- [Excel Reporting](#excel-reporting)

## Introduction
This is an automation framework using **Playwright** with **TypeScript** to run **Google Lighthouse** performance audits.  
It supports running audits for single or multiple URLs, captures diagnostics, takes screenshots, and generates structured Excel reports.  
The project is designed for reusability and scalability, allowing performance testing to be part of your development or CI/CD process.

## Features
- Run Lighthouse audits in normal or incognito mode
- Single URL or batch URL execution
- Capture key diagnostics from reports
- Save HTML, JSON, TXT, and PNG outputs
- Generate Excel reports with performance summaries
- Configurable device types (Mobile, Desktop)
- Dynamic configuration through `lighthouse.config.ts`
- CLI user prompts for screenshot options
- Organized folder structure for daily runs
- GitHub Actions scheduled run to automatically generate and store reports

## Installation

### Prerequisites
- Node.js  
- npm  

### Verify Installations
```bash
node -v
npm -v
```

### Installation Steps

#### Clone the repository:
```bash
git clone https://github.com/avidcutlet/Private-Lighthouse-Automation.git
```

#### Navigate to the project directory:
```bash
cd Private-Lighthouse-Automation
```

#### Install dependencies:
```bash
npm install
```

#### Install Playwright browsers:
```bash
npx playwright install
```

## Folder Structure
```
PRIVATE-LIGHTHOUSE-AUTOMATION/
├── .github/
│   └── workflows/
│       └── daily-run.yml      # GitHub Actions scheduled run configuration
├── config/                    # Configuration files for Lighthouse.
├── data/                      # Stores urls test data.
├── reports/                   # Location where test reports (e.g., Lighthouse results) are generated.
└── lighthouse-08-03-2025-09-59-21-AM/    # A timestamped directory for a specific Lighthouse report.
    ├── html-08-03-2025-09-59-21-AM/      # Contains the HTML version of the Lighthouse report.
    ├── json/                             # Contains the raw JSON data of the Lighthouse report.
    ├── screenshots/                      # Stores screenshots captured during the Lighthouse analysis.
    ├── CheQ_Website_Production_Lighthouse Report_08-03-2025-09-59-21-AM.xlsx               # Contains all the data from simplified text file summary.
    └── lighthouse-simplified-data.txt    # A simplified text file summary of the Lighthouse results.
├── scripts/            # Houses main script runners for Lighthouse (e.g., Run all or single lighthouse).
├── template/           # Houses main template used to by generated excel report.
├── utils/              # A collection of utility functions and helper files used throughout the project.
├── README.md           # Documentation file for the project (e.g., How to run single or multiple links, etc.).
└── tsconfig.json       # The configuration file for the TypeScript compiler.
```

## Running Scripts
### Run Lighthouse for a Single URL
```bash
npm run single:lighthouse
```
#### The script will:
- Run Lighthouse for the URL defined in "SingleLighthouse" data/test-url.json
- Save reports and screenshots in the reports/ folder
- Append results to Excel

### Run Lighthouse for All URLs
```bash
npm run all:lighthouse
```
#### The script will:
- Run Lighthouse for all the URLs defined in "AllLighthouse" data/test-url.json
- Save reports and screenshots in the reports/ folder
- Append results to Excel

## Scheduled Reports (GitHub Actions)
- This project includes a GitHub Actions workflow (.github/workflows/daily-run.yml) that automatically runs Lighthouse daily and pushes results to report branches.

### Accessing Reports
- Today’s report only (snapshot branch, replaced daily):

```bash
git clone --branch auto-daily-report --single-branch https://github.com/avidcutlet/Private-Lighthouse-Automation.git
```

- All historical reports (append-only branch):

```bash
git clone --branch current-day-report --single-branch https://github.com/avidcutlet/Private-Lighthouse-Automation.git
```
- Reports are updated daily at 9:35 AM PHT.

## Excel Reporting
### The framework uses ExcelJS to log performance results.
- Each run appends results to the template file in /reports
- Multiple sheets store overall scores, diagnostics, and audit details