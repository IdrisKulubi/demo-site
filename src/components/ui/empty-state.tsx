import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-6 text-muted-foreground space-y-2"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs">{description}</p>
    </motion.div>
  );
} 