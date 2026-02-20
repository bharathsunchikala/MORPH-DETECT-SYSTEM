import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Zap, Eye, Users, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Hero3D } from '../components/Hero3D';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  };

  return (
    <div className="min-h-screen space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="container-responsive py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-gradient text-shadow">MorphDetect</span>
                <br />
                <span className="text-text-primary">Single-image</span>
                <br />
                <span className="text-text-muted text-2xl sm:text-3xl lg:text-4xl">Morph Detection</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-text-muted leading-relaxed max-w-2xl">
                Detect image morphing. Fast. Explainable. Human-reviewed.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => onNavigate('analyze')}
                className="btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm lg:text-base text-text-dim">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CheckCircle className="w-4 h-4 text-success" />
                <span>GDPR Compliant</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Shield className="w-4 h-4 text-accent-1" />
                <span>Enterprise Ready</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Zap className="w-4 h-4 text-warning" />
                <span>&lt;2s Analysis</span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="relative h-72 sm:h-80 lg:h-96 xl:h-[24rem] flex items-center justify-center"
          >
            <div className="hero-float hero-glow w-full h-full">
              <Hero3D />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-responsive py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            Built for <span className="text-gradient">Security Professionals</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Advanced deep learning models with explainable AI features designed for real-world deployment
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: Zap,
              title: 'Fast Triage',
              description: 'Sub-second inference with GPU acceleration. Batch processing for high-volume scenarios.',
              gradient: 'from-accent-1/20 via-accent-1/10 to-transparent',
              iconColor: 'text-accent-1',
              delay: 0.1
            },
            {
              icon: Eye,
              title: 'Explainable Heatmaps',
              description: 'Pixel-level anomaly detection with interactive heatmap overlays. See exactly where morphing occurs.',
              gradient: 'from-accent-2/20 via-accent-2/10 to-transparent',
              iconColor: 'text-accent-2',
              delay: 0.2
            },
            {
              icon: Users,
              title: 'Human-in-the-Loop',
              description: 'Configurable thresholds, manual review workflows, and audit trails for compliance.',
              gradient: 'from-success/20 via-success/10 to-transparent',
              iconColor: 'text-success',
              delay: 0.3
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: feature.delay
              }}
              className="card-hover group"
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-text-primary mb-4">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed text-sm lg:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container-responsive py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-text-muted">
            Three-step process from upload to actionable insights
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-accent-1/50 via-accent-1/30 to-transparent"></div>
          <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-l from-accent-2/50 via-accent-2/30 to-transparent"></div>

          {[
            {
              step: '01',
              title: 'Upload & Analyze',
              description: 'Drag and drop or capture image. Our AI models analyze in real-time.',
              icon: Upload,
              color: 'accent-1',
              delay: 0.1
            },
            {
              step: '02',
              title: 'AI Detection',
              description: 'Multiple detection algorithms provide comprehensive analysis with confidence scores.',
              icon: Shield,
              color: 'accent-2',
              delay: 0.3
            },
            {
              step: '03',
              title: 'Human Review',
              description: 'Interactive heatmaps and clear recommendations guide your decision.',
              icon: Eye,
              color: 'success',
              delay: 0.5
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: item.delay
              }}
              className="relative text-center group"
              whileHover={{ 
                y: -5,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-${item.color}/20 via-${item.color}/10 to-transparent flex items-center justify-center border border-${item.color}/20 group-hover:border-${item.color}/40 transition-all duration-300`}>
                <item.icon className={`w-10 h-10 text-${item.color}`} />
              </div>
              <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-${item.color} text-bg text-sm font-bold flex items-center justify-center shadow-glow`}>
                {item.step}
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-text-primary mb-4">{item.title}</h3>
              <p className="text-text-muted text-sm lg:text-base leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-responsive py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="card text-center p-8 lg:p-16 bg-gradient-to-br from-accent-1/10 via-accent-2/5 to-transparent border-accent-1/20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            Ready to Detect <span className="text-gradient">Morphing Attacks</span>?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-text-muted mb-10 max-w-3xl mx-auto leading-relaxed">
            Start analyzing images immediately with our production-ready detection system.
          </p>
          
          <motion.button
            onClick={() => onNavigate('analyze')}
            className="btn-primary inline-flex items-center space-x-3 px-10 py-5 text-lg lg:text-xl"
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              boxShadow: "0 20px 40px rgba(124, 231, 255, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};