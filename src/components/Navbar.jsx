
export default function Navbar() {
  return (
    <nav className="bg-green-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#" className="text-xl font-bold flex items-center">
            <span className="mr-2">🌿</span>
            EcoScan
          </a>
          <div className="flex space-x-4">
            <a href="#image-analysis" className="hover:text-green-200">Image Analysis</a>
            <a href="#categories" className="hover:text-green-200">Browse Categories</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
