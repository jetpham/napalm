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
          
          NIXPKGS_ALLOW_UNFREE = "1";
          
          PRISMA_QUERY_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
          PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/schema-engine";
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
