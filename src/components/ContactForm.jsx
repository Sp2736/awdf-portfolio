import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      // Simulate API call
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
      {submitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="flex flex-col items-center justify-center py-10 text-green-600 dark:text-green-400"
        >
          <CheckCircle2 size={48} className="mb-4" />
          <h4 className="text-xl font-bold">Message Sent!</h4>
          <p className="text-sm text-slate-500 mt-2">Thank you for reaching out.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
              <input 
                type="text" 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
            <textarea 
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white transition-all resize-none"
              placeholder="Let's connect..."
            ></textarea>
            <div className="text-right mt-1 text-xs text-slate-400 font-mono">
              {formData.message.length} characters
            </div>
          </div>
          <button 
            type="submit"
            className="flex items-center justify-center gap-2 w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            <Send size={16} /> Send Message
          </button>
        </form>
      )}
    </div>
  );
}
