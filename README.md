# DevWatch

A full stack GitHub repository analytics and QA dashboard. Connect any GitHub repo to get real time CI/CD health monitoring, test coverage tracking, static code analysis and AI generated QA reports powered by Mistral via HuggingFace.

Built as a portfolio project to demonstrate production grade full stack engineering across Java, Python, TypeScript and AI integration.

## Tech Stack

Frontend — Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts

Backend — Java Spring Boot 3.2, REST APIs, OkHttp, JPA

Scripts — Python 3.11, static analysis, report generation

Database — PostgreSQL via Supabase

AI — Mistral 7B via HuggingFace free inference API

Auth — GitHub OAuth via NextAuth

CI/CD — GitHub Actions

Deployment — Vercel frontend, Railway backend

## Project Structure
devwatch/
├── frontend/     Next.js app, dashboard UI, charts, animations
├── backend/      Java Spring Boot REST API, GitHub API integration
├── scripts/      Python analysis scripts, report generation
└── .github/      CI/CD workflow files

## Features

Connect any public or private GitHub repository via OAuth

Real time CI/CD pipeline health monitoring pulling from GitHub Actions

Test coverage tracking with trend charts over time

Static code analysis scoring repos across multiple quality signals

AI generated QA reports in markdown exportable as PDF

Animated dashboard with Framer Motion and Recharts

## Status

Phase 1 complete — Next.js frontend scaffold with animated landing page

Phase 2 complete — Java Spring Boot REST API with GitHub API integration and HuggingFace AI service

Phase 3 complete — Python static analysis, coverage tracking and AI report generation scripts

Phase 4 complete — Full dashboard UI with animated charts, stat cards, CI/CD trends and coverage tracking

Phase 5 complete — QA report page with markdown rendering, metadata panel and PDF export

Phase 6 in progress — GitHub Actions CI/CD workflows
