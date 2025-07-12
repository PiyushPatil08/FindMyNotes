import React from 'react';

const faqs = [
  {
    q: 'How do I upload a note?',
    a: 'Go to the Upload page, fill in the details, and submit your note. It will be available for others to view and download.'
  },
  {
    q: 'Is NoteShare free to use?',
    a: 'Yes! NoteShare is completely free for all users.'
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach out to us via the Contact link in the footer.'
  },
  // Add more FAQs as needed
];

export default function Faq() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-blue-700 mb-1">{faq.q}</div>
            <div className="text-gray-700">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
