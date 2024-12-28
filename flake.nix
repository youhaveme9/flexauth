{
  description = "FlexAuth - inhouse-auth";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: {
    packages."aarch64-darwin".default = derivation {
      name = "FlexAuth";
      system = "aarch64-darwin";
      src = ./.;
      buildInputs = [ nixpkgs.cargo nixpkgs.binutils ];
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
