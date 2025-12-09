declare const bootstrap: any;

import { IUser } from '../models/User';
import { IEnrollment } from '../models/Enrollment';
import { ISubject } from '../models/Subject';

export class HomeFrontend {
  private API_SUBJECTS = "/api/subjects";
  private API_ENROLLMENT = "/api/enrollment";
  private API_ME = "/api/me";
  
  private currentUser: IUser | null = null;
  private userEnrollments: IEnrollment[] = [];

  async init() {
    await this.loadCurrentUser();
    this.loadAndRender();
    
    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      
      if (target?.dataset?.edit?.endsWith("-details")) {
        const id = Number(target.dataset.edit.replace("-details", ""));
        await this.openDetailsModal(id);
      }
      
      if (target?.dataset?.enroll) {
        const subjectId = Number(target.dataset.enroll);
        await this.handleEnroll(subjectId);
      }
      
      if (target?.dataset?.unenroll) {
        const enrollmentId = Number(target.dataset.unenroll);
        await this.handleUnenroll(enrollmentId);
      }
    });
  }

  private async loadCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.currentUser = null;
        return;
      }

      const res = await fetch(this.API_ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        // Token inválido ou expirado
        localStorage.removeItem('token');
        this.currentUser = null;
        return;
      }
      
      this.currentUser = await res.json();
      if (this.currentUser?.id) {
        await this.loadUserEnrollments();
      }
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      this.currentUser = null;
    }
  }

  private async loadUserEnrollments() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${this.API_ENROLLMENT}/user/${this.currentUser!.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(res.json);
      
      if (res.ok) {
        this.userEnrollments = await res.json();
      }
    } catch (err) {
      console.error("Erro ao carregar matrículas:", err);
    }
  }

  private async openDetailsModal(id: number) {
    const res = await fetch(`${this.API_SUBJECTS}/${id}`);
    const subject = await res.json();

    (this.$("#detail-nome") as HTMLElement).textContent = subject.nome;
    (this.$("#detail-descricao") as HTMLElement).textContent = subject.descricao ?? "—";
    (this.$("#detail-professor") as HTMLElement).textContent = subject.professor?.nome ?? "—";
    (this.$("#detail-horario") as HTMLElement).textContent = subject.horario ?? "—";
    (this.$("#detail-sala") as HTMLElement).textContent = subject.sala ?? "—";

    this.loadNotes(id);

    const modal = new bootstrap.Modal(this.$("#subjectDetailsModal")!);
    modal.show();
  }

  private async handleEnroll(subjectId: number) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !this.currentUser) {
        alert("Você precisa fazer login para se matricular");
        return;
      }

      const alunoId = this.currentUser?.aluno?.id;

      if (!alunoId) {
        alert("Erro: Usuário não possui registro de aluno");
        return;
      }

      const res = await fetch(this.API_ENROLLMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          alunoId: alunoId,
          materiaId: subjectId
        })
      });

      if (res.ok) {
        await this.loadUserEnrollments();
        await this.loadAndRender();
        alert("Matrícula realizada com sucesso!");
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (err) {
      console.error("Erro ao matricular:", err);
      alert("Erro ao realizar matrícula");
    }
  }

  private async handleUnenroll(enrollmentId: number) {
    if (!confirm("Deseja realmente se desmatricular?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${this.API_ENROLLMENT}/${enrollmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await this.loadUserEnrollments();
        await this.loadAndRender();
        alert("Desmatriculado com sucesso!");
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (err) {
      console.error("Erro ao desmatricular:", err);
      alert("Erro ao realizar desmatrícula");
    }
  }

  private async loadNotes(subjectId: number) {
    const list = this.$("#notes-list")!;
    list.innerHTML = `
      <li class="list-group-item text-center text-muted" id="notes-loading">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Carregando notas...
      </li>
    `;

    const res = await fetch(`/api/subjects/${subjectId}/notes`);
    const notes = await res.json();

    list.innerHTML = "";

    if (!notes.length) {
      list.innerHTML = `
        <li class="list-group-item text-center text-muted">
          Nenhuma nota ainda.
        </li>
      `;
      return;
    }

    for (const n of notes) {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${this.escapeHtml(n.texto)}</span>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" data-edit-note="${n.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-delete-note="${n.id}">Excluir</button>
        </div>
      `;
      list.appendChild(li);
    }
  }

  private $(sel: string): HTMLElement | null {
    return document.querySelector(sel);
  }

  private escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[m]
    );
  }

  private async fetchSubjects(): Promise<ISubject[]> {
    const res = await fetch(this.API_SUBJECTS);
    if (!res.ok) throw new Error("Erro ao carregar matérias");
    return res.json();
  }

  private renderList(items: ISubject[]) {
    const container = this.$("#subject-list")!;
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhuma matéria cadastrada ainda.</div>
        </div>`;
      return;
    }

    for (const subject of items) {
      const enrollment = this.userEnrollments.find(enrollment => enrollment.materiaId === subject.id);
      const enrollButton = this.getEnrollButton(subject.id!, enrollment);

      const col = document.createElement("div");
      col.className = "col-md-4 mb-3";
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${this.escapeHtml(subject.nome)}</h5>
            <p class="card-text">${this.escapeHtml(subject.descricao || "")}</p>
            <p class="small text-muted">Professor: ${this.escapeHtml(subject.professor?.nome ?? "—")}</p>
            <p class="text-muted small">
              ${this.escapeHtml(
                subject.horario
                  ? subject.horario + (subject.sala ? " • Sala " + subject.sala : "")
                  : subject.sala
                  ? "Sala " + subject.sala
                  : ""
              )}
            </p>
            ${enrollment ? `<button class="btn btn-sm btn-outline-primary me-2" data-edit="${subject.id}-details">Detalhes</button>` : ""}
            ${enrollButton}
          </div>
        </div>`;
      container.appendChild(col);
    }
  }

  private getEnrollButton(subjectId: number, enrollment?: IEnrollment): string {
    if (!this.currentUser) {
      return `<button class="btn btn-sm btn-secondary" disabled>Login para matricular</button>`;
    }

    if (enrollment) {
      return `<button class="btn btn-sm btn-danger" data-unenroll="${enrollment.id}">
        <i class="bi bi-x-circle"></i> Desmatricular
      </button>`;
    }

    return `<button class="btn btn-sm btn-success" data-enroll="${subjectId}">
      <i class="bi bi-check-circle"></i> Matricular
    </button>`;
  }

  private async loadAndRender() {
    try {
      const subjects = await this.fetchSubjects();
      this.renderList(subjects);
    } catch (err) {
      const container = this.$("#subject-list")!;
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Erro ao carregar matérias.</div>
        </div>`;
    }
  }
}