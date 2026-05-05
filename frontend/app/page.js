export default function Home() {
  return (
    <section className="w-full bg-primary text-white py-16 md:py-24 px-4 md:px-8 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          Your Campus Bookshop, Online
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Order stationeries from TACSFON Bookshop and get them delivered straight to your hostel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button className="btn-primary bg-white text-primary hover:bg-white/90">
            Shop Now
          </button>
          <button className="btn-secondary border-white text-white hover:bg-white/10 hover:text-white">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}
