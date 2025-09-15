import Link from "next/link";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-red-600">
        Something went wrong
      </h1>
      <p className="text-lg mb-8 text-gray-700">
        An unexpected error has occurred. Please try again later.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default ErrorPage;
