import { motion } from "framer-motion";

const platforms = [
  { name: "YouTube", color: "#FF0000", icon: "▶" },
  { name: "TikTok", color: "#00F2EA", icon: "♪" },
  { name: "Instagram", color: "#E4405F", icon: "📷" },
  { name: "Facebook", color: "#1877F2", icon: "f" },
  { name: "LinkedIn", color: "#0A66C2", icon: "in" },
];

const Platforms = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-muted-foreground mb-4">Seamlessly publish to all major platforms</p>
          <h2 className="text-3xl font-bold text-foreground">One Click, Every Platform</h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="glass-card p-6 flex flex-col items-center gap-3 min-w-[120px] cursor-pointer"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
              >
                {platform.icon}
              </div>
              <span className="text-foreground font-medium">{platform.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Platforms;
