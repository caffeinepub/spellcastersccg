# Deployment Guide

This document provides instructions for deploying the current build of the application to production.

## Overview

This is a **deployment-only** operation. No application functionality or UI changes should be made as part of publishing. The goal is to create a new deployment from the current code state and make it accessible via the platform preview/live URL.

## Prerequisites

- Ensure all dependencies are installed: `pnpm install`
- Verify the backend canister is deployed and running
- Confirm Internet Identity integration is configured correctly

## Build Process

### 1. Generate Backend Bindings

