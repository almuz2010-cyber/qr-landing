import { clientConfig } from '../clientConfig';
import { motion } from "framer-motion";

export function Hero({ title, subtitle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8 px-4"
        >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: clientConfig.textColor }}>
                {clientConfig.offer}
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed" style={{ color: clientConfig.textColor }}>
                {clientConfig.subtitle}
            </p>
        </motion.div>
    );
}