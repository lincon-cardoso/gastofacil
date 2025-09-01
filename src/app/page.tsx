import Image from "next/image";


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
