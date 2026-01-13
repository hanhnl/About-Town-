#!/bin/bash
# LegiScan API Test Script

echo "🧪 Testing LegiScan API Integration"
echo "===================================="
echo ""

# Check if server is running
if ! lsof -i :5000 >/dev/null 2>&1; then
    echo "❌ Server is not running on port 5000"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo "✓ Server is running"
echo ""

# Test debug endpoint
echo "1️⃣ Checking LegiScan Configuration..."
echo "-----------------------------------"
STATUS=$(curl -s http://localhost:5000/api/debug/status)
CONFIGURED=$(echo $STATUS | grep -o '"legiScanConfigured":[^,}]*' | cut -d: -f2)
WORKING=$(echo $STATUS | grep -o '"working":[^,}]*' | cut -d: -f2)

echo "$STATUS" | python3 -m json.tool 2>/dev/null || echo "$STATUS"
echo ""

if [[ "$CONFIGURED" == "true" ]]; then
    echo "✅ LegiScan API Key: Configured"

    if [[ "$WORKING" == "true" ]]; then
        echo "✅ LegiScan Connection: Working!"
        echo ""

        # Test bills endpoint
        echo "2️⃣ Fetching Maryland Bills..."
        echo "-----------------------------------"
        BILLS=$(curl -s http://localhost:5000/api/bills)
        BILL_COUNT=$(echo $BILLS | grep -o '"billNumber"' | wc -l)
        LIVE_DATA=$(echo $BILLS | grep -o '"isLiveData":true' | wc -l)

        echo "📊 Retrieved $BILL_COUNT bills"

        if [ "$LIVE_DATA" -gt 0 ]; then
            echo "✅ Live data from LegiScan: $LIVE_DATA bills"
            echo ""
            echo "Sample bills:"
            echo "$BILLS" | python3 -c "
import sys, json
bills = json.load(sys.stdin)
for i, bill in enumerate(bills[:3], 1):
    print(f\"  {i}. {bill['billNumber']}: {bill['title'][:60]}...\")
    print(f\"     Status: {bill['status']}, Topic: {bill['topic']}\")
" 2>/dev/null || echo "Could not parse bills"
        else
            echo "⚠️  Still using sample data (isLiveData: false)"
        fi
        echo ""

        echo "3️⃣ Quick Statistics..."
        echo "-----------------------------------"
        STATS=$(curl -s http://localhost:5000/api/stats)
        echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
        echo ""

        echo "🎉 SUCCESS! Your LegiScan integration is working!"
        echo ""
        echo "Next steps:"
        echo "  • Visit http://localhost:5000 to see the website"
        echo "  • Look for the green 'Live Data' badge"
        echo "  • Browse real Maryland state bills"

    else
        echo "⚠️  LegiScan Connection: Failed"
        echo ""
        echo "Possible issues:"
        echo "  • Invalid API key"
        echo "  • Network connectivity issues"
        echo "  • LegiScan API service down"
        echo ""
        echo "Please verify your API key is correct in .env file"
    fi
else
    echo "❌ LegiScan API Key: Not configured"
    echo ""
    echo "To configure:"
    echo "  1. Get your API key from https://legiscan.com"
    echo "  2. Add to .env file: LEGISCAN_API_KEY=your_key_here"
    echo "  3. Restart server: npm run dev"
    echo "  4. Run this script again"
fi

echo ""
echo "===================================="
