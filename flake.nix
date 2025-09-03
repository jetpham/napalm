{
  description = "CTF Jet development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        nodejs = pkgs.nodejs_20;
        pnpm = pkgs.nodePackages.pnpm;
        
        # Prisma engines for NixOS
        prismaEngines = pkgs.prisma-engines;
        
        devTools = with pkgs; [
          git
          postgresql
          curl
          wget
        ];
        
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
            pnpm
            prismaEngines
          ] ++ devTools;
          
          shellHook = ''
            echo "🚀 CTF Jet development environment loaded!"
            echo "📦 Node.js: $(node --version)"
            echo "📦 pnpm: $(pnpm --version)"
            echo "🗄️  Prisma engines: $(ls -la ${prismaEngines}/bin/)"
            echo ""
            echo "Available commands:"
            echo "  pnpm install    - Install dependencies"
            echo "  pnpm dev        - Start development server"
            echo "  pnpm build      - Build for production"
            echo "  prisma init     - Initialize Prisma"
            echo "  prisma generate - Generate Prisma client"
            echo "  prisma db push  - Push schema to database"
            echo ""
            
            # Add node_modules/.bin to PATH for local binaries
            export PATH="$PWD/node_modules/.bin:$PATH"
            
            # Set NODE_ENV to development
            export NODE_ENV=development
            
            # Configure Prisma engines for NixOS
            export PRISMA_QUERY_ENGINE_BINARY="${prismaEngines}/bin/query-engine"
            export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEngines}/bin/schema-engine"
            export PRISMA_MIGRATION_ENGINE_BINARY="${prismaEngines}/bin/migration-engine"
            export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaEngines}/bin/introspection-engine"
            
            # Ignore missing checksums for NixOS
            export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
            
            echo "🔧 Prisma engines configured for NixOS"
            echo "   Query Engine: $PRISMA_QUERY_ENGINE_BINARY"
            echo "   Schema Engine: $PRISMA_SCHEMA_ENGINE_BINARY"
            echo "   Migration Engine: $PRISMA_MIGRATION_ENGINE_BINARY"
            echo "   Introspection Engine: $PRISMA_INTROSPECTION_ENGINE_BINARY"
          '';
          
          # Environment variables
          NODE_ENV = "development";
          NIXPKGS_ALLOW_UNFREE = "1";
          
          # Prisma engine environment variables
          PRISMA_QUERY_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
          PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/schema-engine";
          PRISMA_MIGRATION_ENGINE_BINARY = "${prismaEngines}/bin/migration-engine";
          PRISMA_INTROSPECTION_ENGINE_BINARY = "${prismaEngines}/bin/introspection-engine";
          PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1";
        };
        
        packages = {
          inherit nodejs pnpm prismaEngines;
          
          default = pkgs.symlinkJoin {
            name = "ctfjet-dev";
            paths = [ nodejs pnpm prismaEngines ];
          };
        };
      }
    );
}
