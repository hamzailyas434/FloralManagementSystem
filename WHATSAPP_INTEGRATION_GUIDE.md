# 📱 WhatsApp Integration Guide
## Automatic Order Status Notifications

---

## 🎯 **What You Want:**
When you change an order status → Customer gets WhatsApp message automatically

**Example:**
```
Order Status: "Received" → "In Production"
↓
Customer gets WhatsApp:
"Hi Hamza! Your order #ORD-20251129-0001 is now in production. 
We'll notify you when it's ready! 🎉"
```

---

## 🔧 **3 Ways to Integrate WhatsApp**

### **Option 1: WhatsApp Business API (Official)** ⭐ RECOMMENDED
- **Best for:** Professional businesses
- **Cost:** Paid (conversation-based pricing)
- **Features:** Full automation, templates, rich media
- **Approval:** Requires Meta Business verification

### **Option 2: Twilio WhatsApp API** 💰
- **Best for:** Quick setup
- **Cost:** Pay per message (~$0.005-0.01/msg)
- **Features:** Easy integration, reliable
- **Approval:** Faster than official API

### **Option 3: WhatsApp Web API (Unofficial)** 🆓
- **Best for:** Testing/Small scale
- **Cost:** Free
- **Features:** Basic automation
- **Limitation:** Against WhatsApp ToS, may get banned

---

## 🚀 **RECOMMENDED: Twilio WhatsApp Integration**

### **Why Twilio?**
- ✅ Easy to setup (30 minutes)
- ✅ Reliable delivery
- ✅ Affordable (~$0.005/message)
- ✅ No Meta verification needed
- ✅ Works immediately
- ✅ Official partnership with WhatsApp

---

## 📋 **Step-by-Step Implementation**

### **PHASE 1: Setup Twilio Account** (10 minutes)

#### **Step 1: Create Twilio Account**
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial gives $15 credit)
3. Verify your email and phone

#### **Step 2: Get WhatsApp Sandbox**
1. In Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. You'll see a number like: `+1 415 523 8886`
3. Send this message from YOUR WhatsApp: `join <your-code>`
4. You'll get confirmation

#### **Step 3: Get Credentials**
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: your_auth_token_here
WhatsApp Number: +14155238886 (sandbox number)
```

---

### **PHASE 2: Install Twilio in Your App** (5 minutes)

```bash
npm install twilio --save
```

---

### **PHASE 3: Create WhatsApp Service** (15 minutes)

Create this file: `src/app/services/whatsapp.service.ts`

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  
  // IMPORTANT: In production, move these to environment variables
  private accountSid = 'YOUR_ACCOUNT_SID';
  private authToken = 'YOUR_AUTH_TOKEN';
  private twilioWhatsAppNumber = 'whatsapp:+14155238886'; // Twilio sandbox number
  
  constructor() {}

  async sendOrderStatusUpdate(
    customerPhone: string,
    customerName: string,
    orderNumber: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      // Format phone number (must include country code)
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      
      // Create message based on status
      const message = this.getStatusMessage(customerName, orderNumber, newStatus);
      
      // Send via backend API (we'll create this)
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message
        })
      });

      if (response.ok) {
        console.log('WhatsApp message sent successfully');
        return true;
      } else {
        console.error('Failed to send WhatsApp message');
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, etc.
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('+')) {
      // Assuming Pakistan (+92)
      cleaned = '+92' + cleaned.replace(/^0/, '');
    }
    
    return `whatsapp:${cleaned}`;
  }

  private getStatusMessage(name: string, orderNumber: string, status: string): string {
    const messages: { [key: string]: string } = {
      'Received': `Hi ${name}! 🎉\n\nYour order #${orderNumber} has been received successfully!\n\nWe'll start working on it soon.\n\nThank you for choosing Floral Zone! 🌸`,
      
      'In Progress': `Hi ${name}! 👷‍♂️\n\nGood news! Your order #${orderNumber} is now in production.\n\nOur team is working on it.\n\nFloral Zone 🌸`,
      
      'Completed': `Hi ${name}! ✅\n\nGreat news! Your order #${orderNumber} is ready!\n\nYou can pick it up or we'll deliver it soon.\n\nFloral Zone 🌸`,
      
      'Delivered': `Hi ${name}! 🚚\n\nYour order #${orderNumber} has been delivered!\n\nWe hope you love it! Please share your feedback.\n\nThank you!\nFloral Zone 🌸`,
      
      'Cancelled': `Hi ${name},\n\nYour order #${orderNumber} has been cancelled.\n\nIf you have any questions, please contact us.\n\nFloral Zone 🌸`
    };

    return messages[status] || `Hi ${name}! Your order #${orderNumber} status: ${status}`;
  }

  async sendPaymentReminder(
    customerPhone: string,
    customerName: string,
    orderNumber: string,
    amountRemaining: number
  ): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      
      const message = `Hi ${customerName}! 💰\n\nFriendly reminder:\n\nOrder #${orderNumber}\nPending Amount: Rs. ${amountRemaining.toLocaleString()}\n\nPlease make the payment at your earliest convenience.\n\nThank you!\nFloral Zone 🌸`;
      
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return false;
    }
  }
}
```

---

### **PHASE 4: Create Backend API Endpoint**

Since Twilio requires server-side code (can't expose credentials in frontend), you need a simple backend.

#### **Option A: Node.js/Express Backend** (Recommended)

Create `server/whatsapp-api.js`:

```javascript
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Twilio credentials (use environment variables in production)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';
const twilioWhatsAppNumber = 'whatsapp:+14155238886';

const client = twilio(accountSid, authToken);

app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;

    const result = await client.messages.create({
      from: twilioWhatsAppNumber,
      to: to,
      body: message
    });

    console.log('Message sent:', result.sid);
    res.json({ success: true, messageSid: result.sid });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp API server running on port ${PORT}`);
});
```

**Install dependencies:**
```bash
npm install express twilio cors
```

**Run server:**
```bash
node server/whatsapp-api.js
```

#### **Option B: Supabase Edge Function** (Serverless)

Create Supabase Edge Function:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'

serve(async (req) => {
  const { to, message } = await req.json()

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: to,
        Body: message,
      }),
    }
  )

  const data = await response.json()
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

### **PHASE 5: Integrate with Order Status Change**

Update `order-detail.component.ts`:

```typescript
import { WhatsAppService } from '../../services/whatsapp.service';

export class OrderDetailComponent {
  constructor(
    // ... existing services
    private whatsappService: WhatsAppService
  ) {}

  async updateOrderStatus(newStatus: string) {
    try {
      // Update order status in database
      await this.orderService.updateOrder(this.order.id, {
        order_status: newStatus
      });

      // Send WhatsApp notification
      if (this.order.customer?.phone) {
        await this.whatsappService.sendOrderStatusUpdate(
          this.order.customer.phone,
          this.order.customer.name,
          this.order.order_number,
          newStatus
        );
        
        console.log('WhatsApp notification sent!');
      }

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: 'Customer has been notified via WhatsApp',
        timer: 2000
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }
}
```

---

## 🎨 **Add UI for Manual WhatsApp**

Add button in order detail page:

```html
<button class="btn-whatsapp" (click)="sendWhatsAppUpdate()">
  📱 Send WhatsApp Update
</button>
```

```typescript
async sendWhatsAppUpdate() {
  const { value: message } = await Swal.fire({
    title: 'Send WhatsApp Message',
    input: 'textarea',
    inputLabel: 'Message',
    inputPlaceholder: 'Type your message here...',
    inputValue: this.whatsappService.getStatusMessage(
      this.order.customer.name,
      this.order.order_number,
      this.order.order_status
    ),
    showCancelButton: true
  });

  if (message) {
    const success = await this.whatsappService.sendOrderStatusUpdate(
      this.order.customer.phone,
      this.order.customer.name,
      this.order.order_number,
      this.order.order_status
    );

    if (success) {
      Swal.fire('Sent!', 'WhatsApp message sent successfully', 'success');
    } else {
      Swal.fire('Error', 'Failed to send WhatsApp message', 'error');
    }
  }
}
```

---

## 💰 **Pricing (Twilio)**

### **WhatsApp Messaging Costs:**
- **Conversation-based pricing**
- **Business-initiated:** ~$0.005 - $0.01 per message
- **User-initiated:** Free (first 24 hours)

### **Example Monthly Cost:**
```
100 orders/month × 3 messages each = 300 messages
300 × $0.01 = $3/month

Very affordable! 💰
```

---

## 🎯 **Message Templates**

### **Order Received:**
```
Hi {name}! 🎉

Your order #{orderNumber} has been received!

We'll start working on it soon.

Thank you for choosing Floral Zone! 🌸
```

### **In Production:**
```
Hi {name}! 👷‍♂️

Good news! Your order #{orderNumber} is now in production.

Our team is working on it.

Floral Zone 🌸
```

### **Ready for Pickup:**
```
Hi {name}! ✅

Great news! Your order #{orderNumber} is ready!

You can pick it up anytime.

Floral Zone 🌸
```

### **Delivered:**
```
Hi {name}! 🚚

Your order #{orderNumber} has been delivered!

We hope you love it! Please share your feedback.

Thank you!
Floral Zone 🌸
```

### **Payment Reminder:**
```
Hi {name}! 💰

Friendly reminder:

Order #{orderNumber}
Pending: Rs. {amount}

Please make payment at your convenience.

Thank you!
Floral Zone 🌸
```

---

## 🔒 **Security Best Practices**

### **1. Environment Variables**
Never hardcode credentials!

Create `.env` file:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### **2. Backend Only**
Always send WhatsApp from backend, never from frontend.

### **3. Rate Limiting**
Implement rate limiting to prevent spam.

### **4. User Consent**
Get customer permission before sending WhatsApp messages.

---

## 📊 **Testing Checklist**

### **Before Going Live:**
- [ ] Test with your own number
- [ ] Test all status messages
- [ ] Test payment reminders
- [ ] Check message formatting
- [ ] Verify phone number formatting
- [ ] Test error handling
- [ ] Check delivery reports

---

## 🚀 **Quick Start (Summary)**

### **1. Setup (30 minutes):**
```bash
# 1. Create Twilio account
# 2. Get sandbox number
# 3. Install packages
npm install twilio express cors

# 4. Create backend server
node server/whatsapp-api.js

# 5. Test with your number
```

### **2. Integrate (15 minutes):**
```typescript
// Add WhatsAppService
// Update order status handler
// Test notifications
```

### **3. Go Live:**
```
// Move to production WhatsApp number
// Add environment variables
// Deploy backend
// Start sending!
```

---

## 🎓 **Advanced Features (Future)**

### **1. Rich Media:**
- Send images (product photos)
- Send PDFs (invoices)
- Send location (store address)

### **2. Two-Way Communication:**
- Receive customer replies
- Handle order confirmations
- Customer support chat

### **3. Automation:**
- Scheduled reminders
- Birthday wishes
- Promotional messages

### **4. Analytics:**
- Delivery rates
- Read receipts
- Response rates

---

## 💡 **Pro Tips**

1. **Keep messages short** - Under 160 characters when possible
2. **Use emojis** - Makes messages friendly
3. **Include order number** - Easy reference
4. **Add call-to-action** - "Reply YES to confirm"
5. **Timing matters** - Don't send at night
6. **Personalize** - Use customer name
7. **Test thoroughly** - Before going live

---

## 📞 **Support**

**Twilio Documentation:**
- https://www.twilio.com/docs/whatsapp

**WhatsApp Business API:**
- https://developers.facebook.com/docs/whatsapp

**Need Help?**
- Twilio Support: Very responsive
- Community: Active forums

---

## ✅ **Summary**

**What You Get:**
- ✅ Automatic WhatsApp notifications
- ✅ Order status updates
- ✅ Payment reminders
- ✅ Professional messaging
- ✅ Delivery tracking
- ✅ Customer engagement

**Cost:** ~$3-10/month for 100-300 messages

**Setup Time:** 1 hour

**Business Impact:**
- Better customer communication
- Reduced support calls
- Faster payments
- Professional image
- Customer satisfaction

---

**Ready to implement? Start with Twilio sandbox and test it out!** 📱🚀

**Questions? Let me know and I'll help you set it up!** 💪
