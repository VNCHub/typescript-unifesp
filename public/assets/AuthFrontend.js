"use strict";
(() => {
  // src/frontend/AuthFrontend.ts
  var AuthFrontend = class {
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
})();
//# sourceMappingURL=AuthFrontend.js.map
