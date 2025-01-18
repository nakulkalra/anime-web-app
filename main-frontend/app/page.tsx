export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Website!</h1>
          <p className="text-xl mb-8">Discover amazing features and more.</p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg hover:bg-gray-100 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-10">Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Feature One</h3>
              <p className="text-lg">Description of the first feature goes here.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Feature Two</h3>
              <p className="text-lg">Description of the second feature goes here.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Feature Three</h3>
              <p className="text-lg">Description of the third feature goes here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">About Us</h2>
          <p className="text-lg mb-8">
            We are a passionate team dedicated to delivering the best experience to our users. Learn more about
            our mission and goals.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-500 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">Contact Us</h2>
          <p className="text-lg mb-8">Get in touch with us for more information.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-500 transition">
            Contact
          </button>
        </div>
      </section>
    </>
  );
}
