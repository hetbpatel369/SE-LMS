# Firebase Team Guide

This document explains how our 3-person team should work with Firebase after Hosting is live.

## 1. Team roles

- Firebase Admin stays fixed and manages project permissions, rules, and emergency rollback decisions.
- All 3 teammates work directly on main.
- Any teammate can deploy, but only one person should deploy at a time.

## 2. Access and permissions

1. Add each teammate in Firebase Console, Project settings, Users and permissions.
2. Give least privilege needed.
3. Avoid sharing personal accounts.
4. Remove access immediately for former collaborators.

## 3. Daily workflow

1. Pull latest code.

Command:
git pull origin main

2. Make your changes directly on main.
3. Test auth and Firestore reads and writes locally.
4. Commit and push to main.

Command:
git add -A
git commit -m "short clear message"
git push origin main

5. Tell the team in chat what you changed so others pull latest before continuing.

Note:
- Since all teammates are using GitHub on main, always pull right before you start coding and right before you push.

## 4. Production deploy workflow

Any teammate can do this, but announce in team chat first so only one deploy happens at a time:

1. Pull latest main.
2. Verify current Firebase account.

Command:
firebase login:list

3. Verify project alias.

Command:
firebase use

4. Deploy hosting.

Command:
firebase deploy --only hosting

5. Post deployed URL and commit hash in team chat.

## 5. Working with Firestore after launch

1. Rules first, UI second.
2. Never store sensitive secrets in Firestore documents.
3. Validate role-based access in rules for student, parent, professor, admin.
4. Test reads and writes with non-admin users before release.
5. Deploy rules separately when needed.

Command:
firebase deploy --only firestore:rules

## 6. Safe change checklist

Before push to main:
- Temporary hardcoded values are allowed for short-term work.
- If you add temporary hardcoded values, mention them in team chat and remove them in a follow-up cleanup pass.
- No debug logs exposing user data.
- Firestore queries are scoped to the authenticated user or role.
- Auth redirects still work for each role dashboard.

Before deploy:
- Main is up to date.
- Firebase project is correct.
- Team has been notified that deploy is starting.

## 7. Incident response

If production breaks:
1. Stop new deploys.
2. Identify last good commit.
3. Revert in GitHub and redeploy hosting.
4. If issue is rules-related, deploy previous rules immediately.
5. Document root cause and prevention in team notes.

## 8. Important files in this repo

- firebase.json
- .firebaserc
- js/firebase-config.js
- firebase-hosting-guide.md

Keep these files version controlled and review changes carefully.