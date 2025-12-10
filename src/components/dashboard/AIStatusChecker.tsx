import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  Brain,
  Cpu,
  Bot,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveAIModel } from "@/lib/aiCaptionGenerator";

interface AIService {
  name: string;
  key: string;
  status: 'active' | 'available' | 'missing';
  priority: number;
  icon: any;
  description: string;
  color: string;
}

const AIStatusChecker = () => {
  const [aiServices, setAiServices] = useState<AIService[]>([]);
  const [currentAI, setCurrentAI] = useState<string>('');

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = () => {
    const services: AIService[] = [
      {
        name: 'Z.ai Advanced',
        key: 'VITE_ZAI_API_KEY',
        status: import.meta.env.VITE_ZAI_API_KEY ? 'active' : 'missing',
        priority: 1,
        icon: Sparkles,
        description: 'Premium conversational AI - Highest quality',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      },
      {
        name: 'Groq Llama 3.3',
        key: 'VITE_GROQ_API_KEY',
        status: import.meta.env.VITE_GROQ_API_KEY ? 'available' : 'missing',
        priority: 2,
        icon: Zap,
        description: 'FREE & UNLIMITED - Fastest generation',
        color: 'text-green-500 bg-green-500/10 border-green-500/20'
      },
      {
        name: 'Google Gemini',
        key: 'VITE_GEMINI_API_KEY',
        status: import.meta.env.VITE_GEMINI_API_KEY ? 'available' : 'missing',
        priority: 3,
        icon: Brain,
        description: 'Google AI with Vision capabilities',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      },
      {
        name: 'HuggingFace Mistral',
        key: 'VITE_HUGGINGFACE_API_KEY',
        status: import.meta.env.VITE_HUGGINGFACE_API_KEY ? 'available' : 'missing',
        priority: 4,
        icon: Cpu,
        description: 'Open-source AI model',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      },
      {
        name: 'Smart Fallback',
        key: 'ALWAYS_AVAILABLE',
        status: 'available',
        priority: 5,
        icon: Bot,
        description: 'Always works - No API needed',
        color: 'text-gray-500 bg-gray-500/10 border-gray-500/20'
      }
    ];

    // Determine which AI is currently active (highest priority available)
    const activeService = services.find(service => service.status === 'active') || 
                         services.find(service => service.status === 'available');
    
    if (activeService) {
      services.forEach(service => {
        if (service.name === activeService.name) {
          service.status = 'active';
        }
      });
    }

    setAiServices(services);
    setCurrentAI(getActiveAIModel());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'available':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Currently Active';
      case 'available':
        return 'Available';
      case 'missing':
        return 'Not Configured';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current AI Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Current AI Service</h3>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-foreground">{currentAI}</p>
            <p className="text-sm text-muted-foreground">
              This AI service is currently generating your content
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Services List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">AI Service Priority Chain</h3>
          <Button variant="outline" size="sm" onClick={checkAIStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-3">
          {aiServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 border-2 transition-all ${
                  service.status === 'active' 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : service.status === 'available'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-center gap-4">
                    {/* Priority Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">{service.priority}</span>
                    </div>
                    
                    {/* AI Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* AI Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{service.name}</h4>
                        {service.status === 'active' && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full font-medium">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="text-sm font-medium text-foreground">
                        {getStatusText(service.status)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>How it works:</strong> VidPilot tries AI services in priority order. 
            If the first one fails, it automatically tries the next one. 
            The Smart Fallback always works, even without any API keys!
          </p>
        </div>
      </motion.div>

      {/* Configuration Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Need Better AI?</h3>
        
        <div className="space-y-3">
          {!import.meta.env.VITE_ZAI_API_KEY && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">
                <strong>🚀 Get Z.ai Premium:</strong> Visit https://chat.z.ai/ for the highest quality AI content generation
              </p>
            </div>
          )}
          
          {!import.meta.env.VITE_GROQ_API_KEY && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                <strong>⚡ Get Groq FREE:</strong> Visit https://console.groq.com/keys for unlimited, fast AI generation
              </p>
            </div>
          )}
          
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>🧠 Get Gemini FREE:</strong> Visit https://aistudio.google.com/app/apikey for Google's advanced AI
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIStatusChecker;