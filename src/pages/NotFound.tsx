import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-gold/10">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-6">
            <span className="text-5xl font-display font-bold text-primary">404</span>
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-display font-bold text-foreground">Page Not Found</h1>
        <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold-light text-primary-foreground rounded-lg font-medium transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
