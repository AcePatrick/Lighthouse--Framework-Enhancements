# Lighthouse Playwright TypeScript Automation

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Folder Structure](#folder-structure)
- [Running Scripts](#running-scripts)
- [Configuration](#configuration)
- [Excel Reporting](#excel-reporting)
- [Screenshots and Diagnostics](#screenshots-and-diagnostics)
- [Utilities](#utilities)
- [Future Enhancements](#future-enhancements)

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
git clone https://github.com/avidcutlet/Ligthhouse-Playwright-Typescript-Automation.git
```

#### Navigate to the project directory:
```bash
cd Ligthhouse-Playwright-Typescript-Automation
```

#### Install dependencies:
```bash
npm install
```

## Folder Structure
```
LIGHTHOUSE-PLAYWRIGHT-TYPESCRIPT-AUTOMATION/
├── config/             # Configuration files for Lighthouse.
├── data/               # Stores urls test data.
├── reports/            # Location where test reports (e.g., Lighthouse results) are generated.
└── lighthouse-08-03-2025-09-59-21-AM/    # A timestamped directory for a specific Lighthouse report.
    ├── html/                             # Contains the HTML version of the Lighthouse report.
    ├── json/                             # Contains the raw JSON data of the Lighthouse report.
    ├── screenshots/                      # Stores screenshots captured during the Lighthouse analysis.
    ├── Excel_Template.xlsl               # Contains all the data from simplified text file summary.
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
npm run single:lightouse
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

## Excel Reporting
### The framework uses ExcelJS to log performance results.
- Each run appends results to the template file in /reports
- Multiple sheets store overall scores, diagnostics, and audit details

## Screenshots and Diagnostics
- First diagnostic block is captured from the HTML report
- PNG screenshots are saved with filenames containing URL and timestamp
- TXT files log simplified audit results with scores and paths