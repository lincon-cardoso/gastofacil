import Image from "next/image";

const unusedVariable = "This will trigger an ESLint error"; // Erro proposital para teste

export default function Home() {
  return (
    <header className="container">
      <figure className="imageWrapper">
        <Image
          src="/images/imagem.png"
          alt="Logo do GastoFácil"
          width={150}
          height={150}
          className="image"
        />
      </figure>

      <div className="textContainer">
        <h1>Paga fácil</h1>
      </div>
    </header>
  );
}
