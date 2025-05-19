import { useState } from 'react';
import { FaUsers, FaFileInvoiceDollar, FaBook, FaRegClipboard, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Cloud, Headset, BarChart } from "lucide-react";
import { motion } from 'framer-motion';
import logo from "../../assets/billownlogo.png"


const teamMembers = [
  {
    name: "Amen Amri ",
    title: "Expert-comptable",
  },
  {
    name: "Messi 3amek",
    title: "Conseiller fiscal",
  },
  {
    name: "pedri the king",
    title: "Auditrice financière",
  },
];

const features = [
  {
    icon: <FaUsers size={32} className="text-blue-600 mx-auto" />,
    title: 'Clients',
    desc: 'Gestion simple de votre portefeuille client.',
    details: 'Ajoutez, modifiez et suivez les clients avec des fiches complètes, notes, et historique de facturation.',
  },
  {
    icon: <FaBook size={32} className="text-blue-600 mx-auto" />,
    title: 'Articles',
    desc: 'Suivi des articles et services facturables.',
    details: 'Créez des fiches articles détaillées, gérez les prix, les stocks et les catégories.',
  },
  {
    icon: <FaFileInvoiceDollar size={32} className="text-blue-600 mx-auto" />,
    title: 'Factures',
    desc: 'Création et envoi de factures en quelques clics.',
    details: 'Générez des factures PDF, suivez les paiements et automatisez les rappels.',
  },
  {
    icon: <FaRegClipboard size={32} className="text-blue-600 mx-auto" />,
    title: 'Opérations',
    desc: 'Automatisation des écritures comptables.',
    details: 'Enregistrez automatiquement vos opérations comptables à partir des factures et paiements.',
  },
];
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};
const faqs = [
  { question: "Est-ce que ComptaFacile convient aux petites entreprises ?", answer: "Oui, notre solution est conçue pour répondre aux besoins des PME, indépendants et startups." },
  { question: "Puis-je envoyer des factures depuis ComptaFacile ?", answer: "Absolument ! Vous pouvez créer, personnaliser et envoyer des factures PDF en quelques clics." },
  { question: "Est-ce que mes données sont sécurisées ?", answer: "Oui, nous utilisons un chiffrement avancé et des serveurs sécurisés pour protéger vos données." },
  { question: "Ai-je besoin de connaissances en comptabilité ?", answer: "Non, ComptaFacile automatise les tâches comptables pour que vous puissiez vous concentrer sur votre activité." },
];
const avantagesList = [
  {
    Icon: Cloud,
    title: "Gestion intuitive",
    description: "Interface simple et ergonomique pour une prise en main rapide."
  },
  {
    Icon: Headset,
    title: "Support 24/7",
    description: "Assistance en temps réel pour répondre à toutes vos questions."
  },
  {
    Icon: BarChart,
    title: "Rapports détaillés",
    description: "Statistiques claires et personnalisables pour suivre vos performances."
  }
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeFAQ, setActiveFAQ] = useState(null);
  return (
    <div className="min-h-screen flex flex-col">

      

      {/* Value Proposition Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
              Billown – Votre allié comptable numérique
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Une solution intelligente pour gérer clients, articles, factures et opérations comptables sans expert-comptable.
            </p>
          </motion.div>
          <motion.img
            src={logo}
            alt="Comptabilité moderne"
            className="rounded-xl shadow-lg w-64 mx-auto" 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
/>

        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-blue-50 flex-grow">
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.h2
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-blue-700 mb-4"
          >
            Gérez votre comptabilité facilement
          </motion.h2>
          <p className="text-lg text-blue-600 mb-8">
            Clients, factures, articles et opérations comptables sans expertise requise.
          </p>
          <a
            href="/about"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            En savoir plus
          </a>
        </div>
      </section>


      <section className="container mx-auto px-4 py-16 flex flex-col items-center gap-12 bg-white dark:bg-gray-900">
            <motion.h2
              className="text-4xl font-extrabold text-blue-500 dark:text-blue-400 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Nos avantages
            </motion.h2>
      
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {avantagesList.map(({ Icon, title, description }, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <Icon className="mb-4 w-12 h-12 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    {title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>

          </section>
{/* Support Banner */}
<motion.section
        className="bg-blue-500 text-white py-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        variants={sectionVariants}
        transition={{ duration: 0.6 }}
      >
        <p className="text-lg font-medium">
          Besoin d'aide ? 
          
           appelez <span className="font-bold">****</span>
        </p>
      </motion.section>
      {/* Features Section with Icons */}
      <section className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveFeature(activeFeature === index ? null : index)}
            className="bg-white shadow-md rounded-lg p-6 text-center cursor-pointer transition duration-300"
          >
            {item.icon}
            <h3 className="text-xl font-semibold text-blue-600 mb-2">{item.title}</h3>
            <p className="text-gray-700">{item.desc}</p>
            {activeFeature === index && (
              <div className="mt-4 text-sm text-gray-600 border-t pt-2">
                {item.details}
              </div>
            )}
            <button className="text-sm text-blue-500 mt-2">
              {activeFeature === index ? 'Masquer les détails' : 'Voir plus'}
            </button>
          </motion.div>
        ))}
      </div>
    </section>

  

      {/* Team Section */}
      <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-8">Notre équipe</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map(({ name, title, image }) => (
            <motion.div
              key={name}
              whileHover={{ translateY: -5 }}
              className="bg-blue-50 rounded-lg p-6 shadow-md"
            >
              <img
                src={image}
                alt={name}
                className="h-32 w-32 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-blue-600">{name}</h3>
              <p className="text-gray-700">{title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
   {/* Statistics Section */}
   <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-8">Quelques chiffres clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-extrabold text-blue-600">500+</p>
              <p className="text-gray-700">Entreprises utilisatrices</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-600">1200+</p>
              <p className="text-gray-700">Startups accompagnées</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-600">10k+</p>
              <p className="text-gray-700">Factures générées/mois</p>
            </div>
          </div>
        </div>
      </section> 
      {/* Testimonials Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">Ce qu'ils disent de nous</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Claire Dupont', feedback: 'Billown a transformé notre gestion financière, c’est un gain de temps énorme !' },
              { name: 'John Martin', feedback: 'Interface intuitive et support réactif, je recommande vivement.' }
            ].map((t) => (
              <div key={t.name} className="bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-700 italic mb-4">"{t.feedback}"</p>
                <p className="text-blue-600 font-semibold">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
  {/* FAQ Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">Foire Aux Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div
                  onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-blue-600">{faq.question}</h3>
                  {activeFAQ === idx ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {activeFAQ === idx && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-700 mt-3"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="mb-8">Inscrivez-vous gratuitement et prenez le contrôle de votre comptabilité dès aujourd’hui.</p>
          <a href="/signUp" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">Commencer maintenant</a>
        </div>
      </section>
    </div>

      
    
  );
}