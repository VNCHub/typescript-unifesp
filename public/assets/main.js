"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/frontend/AuthFrontend.ts
  var AuthFrontend;
  var init_AuthFrontend = __esm({
    "src/frontend/AuthFrontend.ts"() {
      "use strict";
      AuthFrontend = class {
        constructor() {
          this.LOGIN_API = "/api/login";
          this.modal = null;
          console.log("AuthFrontend initialized");
        }
        init() {
          this.initModal();
          this.bindEvents();
          this.renderAuthState();
        }
        $(sel) {
          return document.querySelector(sel);
        }
        initModal() {
          const el = this.$("#authModal");
          this.modal = el ? new bootstrap.Modal(el) : null;
        }
        bindEvents() {
          const form = document.querySelector("#login-form");
          document.querySelector("#login-form")?.addEventListener("submit", (e) => this.onLoginSubmit(e));
          document.querySelector("#register-form")?.addEventListener("submit", (e) => this.onRegisterSubmit(e));
          this.$("#btn-open-login")?.addEventListener("click", () => this.modal?.show());
          this.$("#btn-logout")?.addEventListener("click", () => this.doLogout());
        }
        showMsg(msg, type = "info") {
          const main = document.querySelector("main") || document.body;
          const div = document.createElement("div");
          div.className = `alert alert-${type} alert-dismissible fade show`;
          div.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
          main.prepend(div);
          setTimeout(() => div.remove(), 4e3);
        }
        async doLogin(payload) {
          const res = await fetch(this.LOGIN_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message || "Erro no login");
          }
          return res.json();
        }
        async onLoginSubmit(e) {
          e.preventDefault();
          const form = e.target;
          const email = form.querySelector('[name="email"]').value.trim();
          const senha = form.querySelector('[name="senha"]').value.trim();
          try {
            const result = await this.doLogin({ email, senha });
            console.log(result);
            localStorage.setItem("token", result.token);
            this.modal?.hide();
            window.location.href = "/";
          } catch (err) {
            this.showMsg(err.message, "danger");
          }
        }
        async onRegisterSubmit(e) {
          e.preventDefault();
          const form = e.target;
          const payload = {
            nome: form.querySelector('[name="nome"]').value.trim(),
            email: form.querySelector('[name="email"]').value.trim(),
            senha: form.querySelector('[name="senha"]').value.trim(),
            data_nascimento: form.querySelector('[name="data_nascimento"]').value.trim()
          };
          try {
            const res = await fetch("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Erro ao criar conta");
            this.showMsg("Conta criada com sucesso!", "success");
            this.modal?.hide();
          } catch (err) {
            this.showMsg(err.message, "danger");
          }
        }
        doLogout() {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
        renderAuthState() {
          const token = localStorage.getItem("token");
          const btnLogin = this.$("#btn-open-login");
          const btnLogout = this.$("#btn-logout");
          const btnManageSubjects = this.$("#btn-manage-subjects");
          const lblUser = this.$("#auth-username");
          if (!btnLogin || !btnLogout) return;
          if (!token) {
            btnLogin.style.display = "";
            btnLogout.classList.add("d-none");
            btnManageSubjects.classList.add("d-none");
            if (lblUser) lblUser.textContent = "";
            return;
          }
          const [, payloadBase64] = token.split(".");
          const json = JSON.parse(atob(payloadBase64));
          btnLogin.style.display = "none";
          btnLogout.classList.remove("d-none");
          btnManageSubjects.classList.remove("d-none");
          if (lblUser) lblUser.textContent = `Ol\xE1, ${json?.nome ?? ""}`;
        }
      };
    }
  });

  // src/frontend/HomeFrontend.ts
  var HomeFrontend;
  var init_HomeFrontend = __esm({
    "src/frontend/HomeFrontend.ts"() {
      "use strict";
      HomeFrontend = class {
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
    }
  });

  // src/frontend/SubjectsFrontend.ts
  var SubjectsFrontend;
  var init_SubjectsFrontend = __esm({
    "src/frontend/SubjectsFrontend.ts"() {
      "use strict";
      SubjectsFrontend = class {
        constructor() {
          this.API = "/api/subjects";
          this.modal = null;
          this.deleteModal = null;
          this.editingId = null;
          this.deleteId = null;
          this.tableBody = document.getElementById("subjects-table-body");
        }
        init() {
          if (!this.tableBody) return;
          this.initModals();
          this.bindEvents();
          this.loadAndRender();
        }
        $(sel) {
          return document.querySelector(sel);
        }
        initModals() {
          const modalEl = document.getElementById("subjectModal");
          this.modal = modalEl ? new bootstrap.Modal(modalEl) : null;
          const delEl = document.getElementById("confirmDeleteModal");
          this.deleteModal = delEl ? new bootstrap.Modal(delEl) : null;
        }
        bindEvents() {
          this.$("#btn-new-subject")?.addEventListener("click", () => this.openCreate());
          const form = document.getElementById("subject-form");
          form?.addEventListener("submit", (e) => this.onFormSubmit(e));
          this.$("#btn-confirm-delete")?.addEventListener("click", () => this.confirmDelete());
        }
        showMsg(msg, type = "info") {
          const main = document.querySelector("main") || document.body;
          const div = document.createElement("div");
          div.className = `alert alert-${type} alert-dismissible fade show`;
          div.innerHTML = `
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
          main.prepend(div);
          setTimeout(() => div.remove(), 4e3);
        }
        async fetchSubjects() {
          const res = await fetch(this.API);
          if (!res.ok) throw new Error("Erro ao carregar mat\xE9rias.");
          return res.json();
        }
        async fetchProfessores() {
          const res = await fetch("/api/professors");
          if (!res.ok) throw new Error("Erro ao carregar professores");
          return res.json();
        }
        async loadProfessoresSelect(selectedId = null) {
          const select = document.getElementById("input-professorId");
          if (!select) return;
          select.innerHTML = `<option value="">Selecione um professor...</option>`;
          try {
            const profs = await this.fetchProfessores();
            profs.forEach((p) => {
              const opt = document.createElement("option");
              opt.value = String(p.id);
              opt.textContent = `${p.nome}`;
              if (selectedId && selectedId === p.id) opt.selected = true;
              select.appendChild(opt);
            });
          } catch {
            this.showMsg("Erro ao carregar lista de professores.", "danger");
          }
        }
        async loadAndRender() {
          if (!this.tableBody) return;
          try {
            const data = await this.fetchSubjects();
            this.renderTable(data);
          } catch (err) {
            this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-danger text-center">Erro ao carregar.</td></tr>
      `;
          }
        }
        renderTable(items) {
          if (!this.tableBody) return;
          if (!items.length) {
            this.tableBody.innerHTML = `
        <tr><td colspan="6" class="text-center text-muted">Nenhuma mat\xE9ria cadastrada.</td></tr>
      `;
            return;
          }
          this.tableBody.innerHTML = items.map((s) => {
            return `
        <tr>
          <td>${s.id}</td>
          <td>${this.escape(s.nome)}</td>
          <td>${this.escape(s.professor?.nome ?? "\u2014")}</td>
          <td>${this.escape(s.horario ?? "\u2014")}</td>
          <td>${this.escape(s.sala ?? "\u2014")}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-edit="${s.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-delete="${s.id}" data-name="${this.escape(s.nome)}">Excluir</button>
          </td>
        </tr>
      `;
          }).join("");
          this.tableBody.querySelectorAll("[data-edit]").forEach(
            (btn) => btn.addEventListener("click", (e) => this.onEdit(e))
          );
          this.tableBody.querySelectorAll("[data-delete]").forEach(
            (btn) => btn.addEventListener("click", (e) => this.onAskDelete(e))
          );
        }
        escape(s = "") {
          return String(s).replace(/[&<>"']/g, (m) => {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
          });
        }
        openCreate() {
          this.editingId = null;
          document.getElementById("subject-form").reset();
          this.$("#modalTitle").textContent = "Nova mat\xE9ria";
          this.loadProfessoresSelect(null);
          this.modal?.show();
        }
        async onEdit(e) {
          const id = Number(e.currentTarget.dataset.edit);
          if (!id) return;
          try {
            const res = await fetch(`${this.API}/${id}`);
            const item = await res.json();
            this.editingId = item.id;
            document.getElementById("input-id").value = item.id;
            document.getElementById("input-nome").value = item.nome;
            document.getElementById("input-descricao").value = item.descricao ?? "";
            await this.loadProfessoresSelect(item.professorId);
            document.getElementById("input-horario").value = item.horario ?? "";
            document.getElementById("input-sala").value = item.sala ?? "";
            this.$("#modalTitle").textContent = "Editar mat\xE9ria";
            this.modal?.show();
          } catch {
            this.showMsg("Erro ao carregar mat\xE9ria.", "danger");
          }
        }
        async onFormSubmit(e) {
          e.preventDefault();
          const payload = {
            nome: document.getElementById("input-nome").value.trim(),
            descricao: document.getElementById("input-descricao").value.trim() || null,
            professorId: Number(document.getElementById("input-professorId").value.trim()),
            horario: document.getElementById("input-horario").value.trim() || null,
            sala: document.getElementById("input-sala").value.trim() || null
          };
          const url = this.editingId ? `${this.API}/${this.editingId}` : this.API;
          const method = this.editingId ? "PUT" : "POST";
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!res.ok) return this.showMsg("Erro ao salvar mat\xE9ria.", "danger");
          this.modal?.hide();
          this.showMsg(this.editingId ? "Mat\xE9ria atualizada!" : "Mat\xE9ria criada!", "success");
          this.loadAndRender();
        }
        onAskDelete(e) {
          const btn = e.currentTarget;
          this.deleteId = Number(btn.dataset.delete);
          const name = btn.dataset.name;
          this.$("#delete-item-name").textContent = name ?? "";
          this.deleteModal?.show();
        }
        async confirmDelete() {
          if (!this.deleteId) return;
          const res = await fetch(`${this.API}/${this.deleteId}`, { method: "DELETE" });
          if (!res.ok && res.status !== 204) {
            this.showMsg("Erro ao excluir mat\xE9ria.", "danger");
            return;
          }
          this.deleteModal?.hide();
          this.showMsg("Mat\xE9ria exclu\xEDda.", "success");
          this.loadAndRender();
        }
      };
    }
  });

  // src/frontend/main.ts
  var require_main = __commonJS({
    "src/frontend/main.ts"() {
      init_AuthFrontend();
      init_HomeFrontend();
      init_SubjectsFrontend();
      document.addEventListener("DOMContentLoaded", () => {
        new AuthFrontend().init();
        if (document.getElementById("subjects-table-body")) {
          new SubjectsFrontend().init();
        }
        if (document.getElementById("subject-list")) {
          new HomeFrontend().init();
        }
      });
    }
  });
  require_main();
})();
//# sourceMappingURL=main.js.map
