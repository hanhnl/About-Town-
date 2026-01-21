# 🚀 Quick Start: Add Your OpenStates API Key to Vercel

## Exactly What to Type Where

### In the Vercel Dashboard

When you click "Add New" environment variable, you'll see two boxes:

```
┌──────────────────────────────────────────┐
│  Key                                     │
│  ┌────────────────────────────────────┐  │
│  │ OPENSTATES_API_KEY                 │  │ ← Type this EXACTLY
│  └────────────────────────────────────┘  │
│                                          │
│  Value                                   │
│  ┌────────────────────────────────────┐  │
│  │ YOUR_ACTUAL_API_KEY_FROM_EMAIL     │  │ ← Paste the key from your email
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Step-by-Step:

### Box 1 - "Key" field:
Type this EXACTLY (copy-paste to be safe):
```
OPENSTATES_API_KEY
```

**Important**:
- All CAPS
- Underscores (not hyphens or spaces)
- Spelling matters!

---

### Box 2 - "Value" field:
Paste the API key from your OpenStates email.

It will look something like:
```
abc123def456ghi789jkl012mno345pqr678
```

**Tips**:
- Copy the ENTIRE key
- No quotes around it
- No spaces before or after
- Just the key itself

---

### Checkboxes - "Environments":
Check ALL three boxes:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Complete Example

```
Key:    OPENSTATES_API_KEY
Value:  sk_12345abcdefghijklmnop67890QRSTUVWXYZ

Environments:
✅ Production
✅ Preview
✅ Development

[Save]
```

Then click **Save** and **Redeploy**.

---

## Don't Have the API Key Yet?

### Get it in 2 minutes:

1. Go to: https://openstates.org/api/register/

2. Fill out the form:
   - **Name**: Your name
   - **Email**: Your email
   - **Organization**: About-Town
   - **Intended Use**: Civic engagement app for Maryland

3. Click Submit

4. Check your email (arrives instantly)

5. Copy the API key from the email

6. Paste it in the "Value" field in Vercel

---

## After Saving

1. Click "Redeploy" when Vercel prompts you
2. Wait 1-2 minutes
3. Visit your app - bills should now be real Maryland legislation!

---

## Verify It Worked

Visit this URL (replace with your actual domain):
```
https://your-app.vercel.app/api/debug/status
```

Look for:
```json
{
  "openStatesConfigured": true,  ← Should be true
  "openStates": {
    "working": true,  ← Should be true
    "billCount": 5
  },
  "message": "✅ OpenStates API is working!"
}
```

---

## Still Confused?

### Screenshot of What You Should See:

```
Vercel Dashboard → Your Project → Settings → Environment Variables

┌────────────────────────────────────────────────────────────┐
│ Environment Variables                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [+ Add New]                           ← Click this button │
│                                                            │
│  Then fill in:                                             │
│                                                            │
│  Key *                                                     │
│  OPENSTATES_API_KEY                    ← Exactly this      │
│                                                            │
│  Value *                                                   │
│  [paste your key here]                 ← From email        │
│                                                            │
│  Environments *                                            │
│  ☑ Production                          ← Check all 3       │
│  ☑ Preview                                                 │
│  ☑ Development                                             │
│                                                            │
│  [Cancel]  [Save]                      ← Click Save        │
└────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

❌ **Wrong Key Name**:
```
Key: openStatesApiKey     ← WRONG (wrong capitalization)
Key: OPEN_STATES_API_KEY  ← WRONG (wrong spelling)
Key: API_KEY              ← WRONG (incomplete)
```

✅ **Correct**:
```
Key: OPENSTATES_API_KEY   ← CORRECT
```

---

❌ **Adding Quotes**:
```
Value: "abc123def456..."   ← WRONG (don't add quotes)
Value: 'abc123def456...'   ← WRONG (don't add quotes)
```

✅ **Correct**:
```
Value: abc123def456...     ← CORRECT (just the key)
```

---

❌ **Not Selecting All Environments**:
```
☐ Production    ← WRONG (need to check this)
☑ Preview
☑ Development
```

✅ **Correct**:
```
☑ Production    ← CORRECT (all checked)
☑ Preview
☑ Development
```

---

## That's It!

Total time: 2 minutes
Result: Real Maryland legislation on your website! 🎉
