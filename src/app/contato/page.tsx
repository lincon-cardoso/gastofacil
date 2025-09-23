import Footer from "@/components/footer/page";
import Header from "@/components/header/page";
import Image from "next/image";
import styles from "@/app/contato/contato.module.scss";

export default function contato() {
  return (
    <main>
      <Header />
      <section className={styles.contatoSection}>
        <div className={styles.textContainer}>
          <h1 className={styles.contatoTitle}>Contato & Suporte</h1>
          <p className={styles.contatoDescription}>
            Precisa de ajuda? Nossa equipe responde rápido e fala a sua língua.
            Use o formulário, chat, e-mail ou consulte nossa central de ajuda.
          </p>
          <div className={styles.contatoButtons}>
            <button className={styles.contatoButton}>Abrir um chamado</button>
            <button className={`${styles.contatoButton} ${styles.ajuda}`}>
              Ver central de ajuda
            </button>
          </div>
          <p className={styles.contatoInfo}>
            Tempo médio de resposta: &lt; 2h em horário comercial • LGPD • SSL
          </p>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src="/images/contato.png" // Certifique-se de que a imagem está no diretório public/images
            alt="Suporte ao cliente"
            width={400}
            height={300}
            className={styles.contatoImage}
          />
        </div>
      </section>
      <section className={styles.contactChannels}>
        <h2 className={styles.title}>Canais de atendimento</h2>
        <p className={styles.description}>
          Escolha o melhor canal para você. Estamos prontos para ajudar.
        </p>
        <div className={styles.channels}>
          <div className={styles.channel}>
            <span className={styles.icon}>📧</span>
            <p className={styles.channelTitle}>E-mail</p>
            <p className={styles.channelInfo}>suporte@gastofacil.app</p>
          </div>
          <div className={styles.channel}>
            <span className={styles.icon}>💬</span>
            <p className={styles.channelTitle}>Chat</p>
            <p className={styles.channelInfo}>No app (09h–18h)</p>
          </div>
          <div className={styles.channel}>
            <span className={styles.icon}>📞</span>
            <p className={styles.channelTitle}>Telefone</p>
            <p className={styles.channelInfo}>(11) 4000-0000 (Seg–Sex)</p>
          </div>
          <div className={styles.channel}>
            <span className={styles.icon}>📚</span>
            <p className={styles.channelTitle}>Central de ajuda</p>
            <p className={styles.channelInfo}>Tutoriais e FAQs</p>
          </div>
          <div className={styles.channel}>
            <span className={styles.icon}>📱</span>
            <p className={styles.channelTitle}>WhatsApp</p>
            <p className={styles.channelInfo}>Em breve</p>
          </div>
        </div>
      </section>
      <section className={styles.openTicketFormWrapper}>
        <div className={styles.background}>
          <div className={styles.formContainer}>
            <h2 className={styles.title}>Abra um chamado</h2>
            <p className={styles.description}>
              Quanto mais detalhes você enviar, mais rápido conseguimos te
              ajudar.
            </p>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome</label>
                <input type="text" id="name" placeholder="Seu nome" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" placeholder="voce@email.com" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="subject">Assunto</label>
                <select id="subject">
                  <option value="">Selecione...</option>
                  <option value="suporte">Suporte</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="priority">Prioridade</label>
                <select id="priority">
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                </select>
                <small>“Urgente” direciona ao time de plantão.</small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Mensagem</label>
                <textarea
                  id="message"
                  placeholder="Descreva o que está acontecendo, passos, prints..."
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="attachments">Anexos (opcional)</label>
                <input type="file" id="attachments" />
                <small>Aceitamos PNG, JPG, PDF (máx. 10MB).</small>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input type="checkbox" id="lgpd" />
                  Concordo com o tratamento dos meus dados conforme a LGPD para
                  atendimento desta solicitação.
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Enviar
                </button>
                <button type="reset" className={styles.resetButton}>
                  Limpar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
