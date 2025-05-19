import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Header Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">À propos de ComptaFacile</h1>
          <p className="text-lg max-w-2xl mx-auto">Une solution moderne et accessible pour gérer facilement votre comptabilité, sans stress et sans expert-comptable.</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Notre histoire</h2>
        <p className="text-lg text-gray-700">
          Fondée en 2023, ComptaFacile est née du constat que de nombreuses petites entreprises et indépendants
          peinent à gérer leur comptabilité de manière simple et efficace. Notre objectif est de démocratiser l'accès
          à une comptabilité claire et accessible, en proposant une solution en ligne intuitive et adaptée aux besoins
          spécifiques de chaque utilisateur.
        </p>
      </section>

      {/* Our Mission */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">Notre mission</h2>
          <p className="text-lg text-gray-700">
            Chez ComptaFacile, nous croyons que la comptabilité ne doit pas être une source de stress. Nous nous
            engageons à offrir une plateforme fiable, sécurisée et facile à utiliser, permettant à nos clients de
            gérer leurs finances en toute sérénité.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="container mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Nos valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Simplicité</h3>
            <p className="text-gray-700">Une interface claire et intuitive pour une prise en main rapide.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Fiabilité</h3>
            <p className="text-gray-700">Des outils robustes garantissant la précision de vos données.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Accessibilité</h3>
            <p className="text-gray-700">Des tarifs adaptés aux petites structures et indépendants.</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Support</h3>
            <p className="text-gray-700">Une équipe dédiée pour vous accompagner à chaque étape.</p>
          </div>
        </div>
      </section>

      

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Rejoignez-nous dès aujourd'hui</h2>
          <p className="text-lg mb-6">Commencez à gérer votre comptabilité de manière simple et efficace avec ComptaFacile.</p>
          <Link to="/signUp" className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition">
            Démarrer gratuitement
          </Link>
        </div>
      </section>

    </div>
  );
}
