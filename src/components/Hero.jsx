import { motion } from "framer-motion";

export function Hero({ title, subtitle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8 px-4"
        >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {title}
            </h1>
            <p className="text-lg sm:text-xl text-neutral-200 leading-relaxed">
                {subtitle}
            </p>
        </motion.div>
    );
}