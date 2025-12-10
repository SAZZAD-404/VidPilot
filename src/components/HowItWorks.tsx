import { motion } from "framer-motion";
import { PenLine, Wand2, Calendar, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: PenLine,
    title: "Describe Your Video",
    description: "Enter a topic or idea. Our AI generates a compelling script tailored to your niche."
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI Creates Video",
    description: "Select a template. AI adds captions, transitions, music, and effects automatically."
  },
  {
    step: "03",
    icon: Calendar,
    title: "Schedule Posts",
    description: "Pick platforms and times. Set it once or schedule weeks of content in advance."
  },
  {
    step: "04",
    icon: Rocket,
    title: "Watch It Go Viral",
    description: "Your content posts automatically. Track performance and optimize with AI insights."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 hero-gradient rotate-180" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            From Idea to Viral in
            <span className="gradient-text"> 4 Steps </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our streamlined workflow makes content creation effortless
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="glass-card p-6 relative">
                <span className="absolute -top-4 -left-2 text-6xl font-bold text-primary/10">
                  {step.step}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
