import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: "Who is Manjeet Yadav?",
    a: "I am a Full-Stack Developer and Software Engineer passionate about building scalable, high-performance web applications with clean, maintainable architecture."
  },
  {
    q: "What technologies does he work with?",
    a: "I specialize in the MERN stack (MongoDB, Express, React, Node.js), TypeScript, and system design, with a strong focus on algorithmic problem-solving."
  },
  {
    q: "What projects has he built?",
    a: "I have built various projects ranging from full-stack SaaS platforms to complex 3D visualizations and interactive web experiences."
  },
  {
    q: "How many DSA problems has he solved?",
    a: "I have solved over 550+ Data Structures and Algorithms problems across platforms like LeetCode and GeeksforGeeks."
  },
  {
    q: "What is his LeetCode peak rating?",
    a: "My peak rating reflects my dedication to solving complex algorithmic challenges efficiently."
  },
  {
    q: "Is he open to software engineering opportunities?",
    a: "Yes, I am actively looking for challenging software engineering opportunities where I can contribute to impactful projects."
  },
  {
    q: "How can someone contact him?",
    a: "You can reach out through the contact form on this website, or connect with me via GitHub or LinkedIn."
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <section id="faq" className="py-24 px-6 bg-darkBg">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-display text-lightText uppercase tracking-tight mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border border-cardBorder bg-cardBg">
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-medium text-lightText font-body">
                  {item.q}
                </span>
                <span className="text-brandAccent">
                  {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-mutedText leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
