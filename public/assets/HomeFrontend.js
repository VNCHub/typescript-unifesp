"use strict";
(() => {
  // src/frontend/HomeFrontend.ts
  var HomeFrontend = class {
    constructor() {
      this.API_SUBJECTS = "/api/subjects";
      this.API_ENROLLMENT = "/api/enrollment";
      this.API_ME = "/api/me";
      this.currentUser = null;
      this.userEnrollments = [];
    }
    async init() {
      await this.loadCurrentUser();
      this.loadAndRender();
      document.addEventListener("click", async (e) => {
        const target = e.target;
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
    async loadCurrentUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.currentUser = null;
          return;
        }
        const res = await fetch(this.API_ME, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          this.currentUser = null;
          return;
        }
        this.currentUser = await res.json();
        if (this.currentUser?.id) {
          await this.loadUserEnrollments();
        }
      } catch (err) {
        console.error("Erro ao carregar usu\xE1rio:", err);
        this.currentUser = null;
      }
    }
    async loadUserEnrollments() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${this.API_ENROLLMENT}/user/${this.currentUser.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        console.log(res.json);
        if (res.ok) {
          this.userEnrollments = await res.json();
        }
      } catch (err) {
        console.error("Erro ao carregar matr\xEDculas:", err);
      }
    }
    async openDetailsModal(id) {
      const res = await fetch(`${this.API_SUBJECTS}/${id}`);
      const subject = await res.json();
      this.$("#detail-nome").textContent = subject.nome;
      this.$("#detail-descricao").textContent = subject.descricao ?? "\u2014";
      this.$("#detail-professor").textContent = subject.professor?.nome ?? "\u2014";
      this.$("#detail-horario").textContent = subject.horario ?? "\u2014";
      this.$("#detail-sala").textContent = subject.sala ?? "\u2014";
      this.loadNotes(id);
      const modal = new bootstrap.Modal(this.$("#subjectDetailsModal"));
      modal.show();
    }
    async handleEnroll(subjectId) {
      try {
        const token = localStorage.getItem("token");
        if (!token || !this.currentUser) {
          alert("Voc\xEA precisa fazer login para se matricular");
          return;
        }
        const alunoId = this.currentUser?.aluno?.id;
        if (!alunoId) {
          alert("Erro: Usu\xE1rio n\xE3o possui registro de aluno");
          return;
        }
        const res = await fetch(this.API_ENROLLMENT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            alunoId,
            materiaId: subjectId
          })
        });
        if (res.ok) {
          await this.loadUserEnrollments();
          await this.loadAndRender();
          alert("Matr\xEDcula realizada com sucesso!");
        } else {
          const error = await res.json();
          alert(`Erro: ${error.error}`);
        }
      } catch (err) {
        console.error("Erro ao matricular:", err);
        alert("Erro ao realizar matr\xEDcula");
      }
    }
    async handleUnenroll(enrollmentId) {
      if (!confirm("Deseja realmente se desmatricular?")) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${this.API_ENROLLMENT}/${enrollmentId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
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
        alert("Erro ao realizar desmatr\xEDcula");
      }
    }
    async loadNotes(subjectId) {
      const list = this.$("#notes-list");
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
    $(sel) {
      return document.querySelector(sel);
    }
    escapeHtml(s = "") {
      return String(s).replace(
        /[&<>"']/g,
        (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]
      );
    }
    async fetchSubjects() {
      const res = await fetch(this.API_SUBJECTS);
      if (!res.ok) throw new Error("Erro ao carregar mat\xE9rias");
      return res.json();
    }
    renderList(items) {
      const container = this.$("#subject-list");
      container.innerHTML = "";
      if (!items.length) {
        container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhuma mat\xE9ria cadastrada ainda.</div>
        </div>`;
        return;
      }
      for (const subject of items) {
        const enrollment = this.userEnrollments.find((enrollment2) => enrollment2.materiaId === subject.id);
        const enrollButton = this.getEnrollButton(subject.id, enrollment);
        const col = document.createElement("div");
        col.className = "col-md-4 mb-3";
        col.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${this.escapeHtml(subject.nome)}</h5>
            <p class="card-text">${this.escapeHtml(subject.descricao || "")}</p>
            <p class="small text-muted">Professor: ${this.escapeHtml(subject.professor?.nome ?? "\u2014")}</p>
            <p class="text-muted small">
              ${this.escapeHtml(
          subject.horario ? subject.horario + (subject.sala ? " \u2022 Sala " + subject.sala : "") : subject.sala ? "Sala " + subject.sala : ""
        )}
            </p>
            ${enrollment ? `<button class="btn btn-sm btn-outline-primary me-2" data-edit="${subject.id}-details">Detalhes</button>` : ""}
            ${enrollButton}
          </div>
        </div>`;
        container.appendChild(col);
      }
    }
    getEnrollButton(subjectId, enrollment) {
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
    async loadAndRender() {
      try {
        const subjects = await this.fetchSubjects();
        this.renderList(subjects);
      } catch (err) {
        const container = this.$("#subject-list");
        container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Erro ao carregar mat\xE9rias.</div>
        </div>`;
      }
    }
  };
})();
//# sourceMappingURL=HomeFrontend.js.map
