{
  description = "FlexAuth - inhouse-auth";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: 
  let
    system = "aarch64-darwin";
    name = "FlexAuth";
    src = ./.;
    pkgs = nixpkgs.legacyPackages.${system};
  in
  {
    packages.${system}.default = derivation {
      
      inherit name system src;
      
      buildInputs = with pkgs; [
        rust
        cargo
      ];

      phases = [ "buildPhase" ];
      buildPhase = ''
        CARGO_TARGET_DIR=$out ${nixpkgs.cargo}/bin/cargo build --manifest-path $src/Cargo.toml --release 
        ${nixpkgs.binutils}/bin/strip $out/release/flakes -o /tmp/test
        rm -rf $out
        mv /tmp/test $out
      '';
    };
  };
}
