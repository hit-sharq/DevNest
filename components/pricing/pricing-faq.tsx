import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PricingFAQ() {
  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept PayPal and M-Pesa payments. Both methods are secure and processed instantly.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all new users get a 7-day free trial to test our platform before choosing a paid plan.",
    },
    {
      question: "What happens if I exceed my daily limits?",
      answer:
        "Your campaigns will pause automatically when limits are reached. You can upgrade your plan for higher limits.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service.",
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-muted-foreground">Everything you need to know about our pricing and plans</p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
