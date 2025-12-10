import { fetchCurrentUser, fetchEnrollments, fetchSubjects, enrollRequest, unenrollRequest, createClassNote, getClassNoteById, updateClassNote, deleteClassNote} from "./HomeApi";
import { renderList } from "./HomeRender";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

declare const bootstrap: any;

export class HomeFrontend {
  private noteEditor: EasyMDE | null = null;
  private currentEnrollmentId: number | null = null;
  private currentUser: any = null;
  private userEnrollments: any[] = [];

  async init() {
    this.currentUser = await fetchCurrentUser();

    if (this.currentUser?.id) {
      this.userEnrollments = await fetchEnrollments(this.currentUser.id);
    }

    await this.loadAndRender();

    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;

      const btn = target.closest("[data-edit], [data-enroll], [data-unenroll], [data-new-note], [data-edit-note], [data-delete-note], [data-view-note]");
      if (!btn) return;

      if (btn instanceof HTMLElement) {

        if (btn.dataset.edit?.endsWith("-details")) {
          const id = Number(btn.dataset.edit.replace("-details", ""));
          await this.openDetailsModal(id);
        }

        if (btn.dataset.enroll) {
          await this.handleEnroll(Number(btn.dataset.enroll));
        }

        if (btn.dataset.unenroll) {
          await this.handleUnenroll(Number(btn.dataset.unenroll));
        }

        if (btn.dataset.newNote) {
          await this.handleNewNote(Number(btn.dataset.newNote));
        }

        if (btn.dataset.editNote) {
          await this.handleEditNote(Number(btn.dataset.editNote));
        }

        if (btn.dataset.deleteNote) {
          await this.handleDeleteNote(Number(btn.dataset.deleteNote));
        }

        if (btn.dataset.viewNote) {
          await this.handleViewNote(Number(btn.dataset.viewNote));
        }
      }
    });

  }

  private async loadAndRender() {
    const subjects = await fetchSubjects();
    renderList(subjects, this.currentUser, this.userEnrollments);
  }

  private async handleEnroll(subjectId: number) {
    const alunoId = this.currentUser?.aluno?.id;
    if (!alunoId) return alert("Erro: usuário sem aluno associado");

    const res = await enrollRequest(alunoId, subjectId);

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || "Erro ao matricular");
    }

    this.userEnrollments = await fetchEnrollments(this.currentUser.id);
    await this.loadAndRender();
    alert("Matrícula realizada!");
  }

  private async handleUnenroll(id: number) {
    if (!confirm("Deseja realmente se desmatricular?")) return;

    const res = await unenrollRequest(id);

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || "Erro ao desmatricular");
    }

    this.userEnrollments = await fetchEnrollments(this.currentUser.id);
    await this.loadAndRender();
    alert("Desmatrícula realizada!");
  }

  private async openDetailsModal(subjectId: number) {
    const res = await fetch(`/api/subjects/${subjectId}`);
    const subject = await res.json();

    document.querySelector("#detail-nome")!.textContent = subject.nome;
    document.querySelector("#detail-descricao")!.textContent = subject.descricao ?? "—";
    document.querySelector("#detail-professor")!.textContent = subject.professor?.nome ?? "—";
    document.querySelector("#detail-horario")!.textContent = subject.horario ?? "—";
    document.querySelector("#detail-sala")!.textContent = subject.sala ?? "—";

    const enrollment = this.userEnrollments.find(e => e.materiaId === subjectId);

    if (enrollment) {
      document.querySelector("#btn-add-note")!.setAttribute("data-new-note", enrollment.id);
      await this.loadClassNotes(enrollment.id);
    } else {
      document.querySelector("#notes-list")!.innerHTML = `
        <li class="list-group-item text-center text-muted">
          Matricule-se para ver notas.
        </li>
      `;
    }

    const modal = new bootstrap.Modal(document.querySelector("#subjectDetailsModal")!);
    modal.show();
  }

  // ✅ Método para inicializar o EasyMDE
  private initializeEditor(initialContent: string = "") {
    // Destruir editor antigo se existir
    if (this.noteEditor) {
      this.noteEditor.toTextArea();
      this.noteEditor = null;
    }

    const textarea = document.querySelector("#editor-textarea") as HTMLTextAreaElement;
    textarea.value = initialContent;

    this.noteEditor = new EasyMDE({
      element: textarea,
      spellChecker: false,
      autofocus: true,
      placeholder: "Digite o conteúdo da aula em Markdown...",
      minHeight: "300px",
      status: false,
      toolbar: [
        "bold", "italic", "heading", "|",
        "quote", "unordered-list", "ordered-list", "|",
        "link", "image", "|",
        "preview", "side-by-side", "fullscreen", "|",
        "guide"
      ]
    });
  }

  private async handleNewNote(enrollmentId: number) {
    this.currentEnrollmentId = enrollmentId;

    (document.querySelector("#note-title-input") as HTMLInputElement).value = "";

    // Limpar editor antigo
    if (this.noteEditor) {
      this.noteEditor.toTextArea();
      this.noteEditor = null;
    }

    const modalEl = document.getElementById("classNoteModal")!;
    const modal = new bootstrap.Modal(modalEl);
    
    document.querySelector("#classNoteModalTitle")!.textContent = "Nova Nota";

    modal.show();

    // ✅ Inicializar editor após modal ser exibido
    modalEl.addEventListener("shown.bs.modal", () => {
      this.initializeEditor("");
    }, { once: true });

    (document.querySelector("#save-classnote-btn") as HTMLButtonElement).onclick =
      () => this.saveNewNote();
  }

  private async saveNewNote() {
    const titulo = (document.querySelector("#note-title-input") as HTMLInputElement).value.trim();
    const markdown = this.noteEditor?.value() || "";

    if (!titulo) return alert("Insira um título.");

    const res = await createClassNote({
      alunoMatriculaId: this.currentEnrollmentId!,
      titulo,
      markdown
    });

    if (!res.ok) return alert("Erro ao criar nota.");

    alert("Nota criada!");
    
    // Limpar editor
    if (this.noteEditor) {
      this.noteEditor.toTextArea();
      this.noteEditor = null;
    }
    
    bootstrap.Modal.getInstance(document.querySelector("#classNoteModal"))?.hide();

    // Recarregar as notas
    await this.loadClassNotes(this.currentEnrollmentId!);
  }

  private async handleEditNote(id: number) {
    const note = await getClassNoteById(id);
    if (!note) return alert("Erro ao carregar nota.");

    this.currentEnrollmentId = note.alunoMatriculaId;

    document.querySelector("#classNoteModalTitle")!.textContent = "Editar Nota";
    (document.querySelector("#note-title-input") as HTMLInputElement).value = note.titulo;

    // Limpar editor antigo
    if (this.noteEditor) {
      this.noteEditor.toTextArea();
      this.noteEditor = null;
    }

    const modalEl = document.getElementById("classNoteModal")!;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    // ✅ Inicializar editor após modal ser exibido
    modalEl.addEventListener("shown.bs.modal", () => {
      this.initializeEditor(note.markdown);
    }, { once: true });

    (document.querySelector("#save-classnote-btn") as HTMLButtonElement)!.onclick =
      () => this.saveEditedNote(id);
  }

  private async saveEditedNote(id: number) {
    const titulo = (document.querySelector("#note-title-input") as HTMLInputElement).value.trim();
    const markdown = this.noteEditor?.value() || "";

    if (!titulo) return alert("Insira um título.");

    const res = await updateClassNote(id, { titulo, markdown });
    if (!res.ok) return alert("Erro ao atualizar nota.");

    alert("Nota atualizada!");

    // Limpar editor
    if (this.noteEditor) {
      this.noteEditor.toTextArea();
      this.noteEditor = null;
    }

    bootstrap.Modal.getInstance(document.getElementById("classNoteModal"))?.hide();

    if (this.currentEnrollmentId)
      await this.loadClassNotes(this.currentEnrollmentId);
  }

  private async handleDeleteNote(id: number) {
    if (!confirm("Deseja excluir esta nota?")) return;

    const res = await deleteClassNote(id);

    if (!res.ok) {
      alert("Erro ao deletar nota.");
      return;
    }

    alert("Nota removida!");
    
    if (this.currentEnrollmentId) {
      await this.loadClassNotes(this.currentEnrollmentId);
    }
  }

  private async handleViewNote(id: number) {
    const note = await getClassNoteById(id);
    console.log(note);
    if (!note) return alert("Erro ao carregar nota.");

    // Preencher modal de visualização
    document.querySelector("#view-note-title")!.textContent = note.titulo;
    document.querySelector("#view-note-date")!.textContent = 
      new Date(note.data).toLocaleDateString("pt-BR", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric" 
      });

    // Converter Markdown para HTML
    const markdownContent = document.querySelector("#view-note-content")!;
    markdownContent.innerHTML = this.markdownToHtml(note.markdown);

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById("viewNoteModal"));
    modal.show();
  }

  // Função simples para converter Markdown para HTML
  private markdownToHtml(markdown: string): string {
    let html = markdown;

    // Títulos
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Negrito e itálico
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Imagens
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="img-fluid my-2">');

    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Blocos de código
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Listas não ordenadas
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Listas ordenadas
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Citações
    html = html.replace(/^> (.+)$/gim, '<blockquote class="blockquote border-start border-3 ps-3 my-3">$1</blockquote>');

    // Quebras de linha
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Linha horizontal
    html = html.replace(/^---$/gim, '<hr>');

    return html;
  }

  private async loadClassNotes(enrollmentId: number) {
    const list = document.querySelector("#notes-list")!;
    list.innerHTML = `
      <li class="list-group-item text-center text-muted" id="notes-loading">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Carregando notas...
      </li>
    `;

    const res = await fetch(`/api/classnotes/enrollment/${enrollmentId}`);
    const notes = await res.json();

    list.innerHTML = "";

    if (!notes.length) {
      list.innerHTML = `
        <li class="list-group-item text-center text-muted">
          Nenhuma nota registrada.
        </li>
      `;
      return;
    }

    for (const n of notes) {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";

      li.innerHTML = `
        <div>
          <strong>${n.titulo}</strong>
          <br>
          <small class="text-muted">${new Date(n.data).toLocaleDateString()}</small>
        </div>

        <div>
          <button class="btn btn-sm btn-outline-primary me-1" data-view-note="${n.id}">
            Visualizar
          </button>
          
          <button class="btn btn-sm btn-outline-secondary me-1" data-edit-note="${n.id}">
            Editar
          </button>

          <button class="btn btn-sm btn-outline-danger" data-delete-note="${n.id}">
            Excluir
          </button>
        </div>
      `;

      list.appendChild(li);
    }
  }
}