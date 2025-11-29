import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  
  // Twilio configuration - Add your credentials in environment or here
  private readonly ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
  private readonly TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';
  
  // Backend API endpoint (we'll create this)
  private readonly API_URL = 'http://localhost:3000/api/send-whatsapp';

  constructor() {}

  /**
   * Send WhatsApp notification when order status changes
   */
  async sendOrderStatusNotification(
    customerPhone: string,
    customerName: string,
    orderNumber: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      
      // Get message based on status
      const message = this.getStatusMessage(customerName, orderNumber, newStatus);
      
      console.log('Sending WhatsApp to:', formattedPhone);
      console.log('Message:', message);
      
      // Send via backend API
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ WhatsApp sent successfully! SID:', result.messageSid);
        return true;
      } else {
        console.error('❌ Failed to send WhatsApp:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending WhatsApp:', error);
      return false;
    }
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    // If starts with 0, remove it and add Pakistan code
    if (cleaned.startsWith('0')) {
      cleaned = '+92' + cleaned.substring(1);
    }
    
    // If doesn't start with +, add Pakistan code
    if (!cleaned.startsWith('+')) {
      cleaned = '+92' + cleaned;
    }
    
    // Add whatsapp: prefix
    return `whatsapp:${cleaned}`;
  }

  /**
   * Get message template based on order status
   */
  private getStatusMessage(name: string, orderNumber: string, status: string): string {
    const messages: { [key: string]: string } = {
      'Received': `Hi ${name}! 🎉\n\nYour order #${orderNumber} has been received successfully!\n\nWe'll start working on it soon.\n\nThank you for choosing Floral Zone! 🌸`,
      
      'In Progress': `Hi ${name}! 👷‍♂️\n\nGood news! Your order #${orderNumber} is now in production.\n\nOur team is working on it.\n\nFloral Zone 🌸`,
      
      'Completed': `Hi ${name}! ✅\n\nGreat news! Your order #${orderNumber} is ready!\n\nYou can pick it up anytime.\n\nFloral Zone 🌸`,
      
      'Delivered': `Hi ${name}! 🚚\n\nYour order #${orderNumber} has been delivered!\n\nWe hope you love it! Please share your feedback.\n\nThank you!\nFloral Zone 🌸`,
      
      'Cancelled': `Hi ${name},\n\nYour order #${orderNumber} has been cancelled.\n\nIf you have any questions, please contact us.\n\nFloral Zone 🌸`
    };

    return messages[status] || `Hi ${name}! Your order #${orderNumber} status has been updated to: ${status}`;
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    customerPhone: string,
    customerName: string,
    orderNumber: string,
    amountRemaining: number
  ): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      
      const message = `Hi ${customerName}! 💰\n\nFriendly payment reminder:\n\nOrder #${orderNumber}\nPending Amount: Rs. ${amountRemaining.toLocaleString()}\n\nPlease make the payment at your earliest convenience.\n\nThank you!\nFloral Zone 🌸`;
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message
        })
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return false;
    }
  }

  /**
   * Send custom message
   */
  async sendCustomMessage(
    customerPhone: string,
    message: string
  ): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message
        })
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error('Error sending custom message:', error);
      return false;
    }
  }
}
