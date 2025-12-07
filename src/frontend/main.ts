import { AuthFrontend } from "./AuthFrontend";
import { HomeFrontend } from "./HomeFrontend";
import { SubjectsFrontend } from "./SubjectsFrontend";

document.addEventListener("DOMContentLoaded", () => {
  new AuthFrontend().init();

  // só inicia se a página for a de subjects
  if (document.getElementById("subjects-table-body")) {
    new SubjectsFrontend().init();
  }

  if (document.getElementById("subject-list")) {
    new HomeFrontend().init();
  }
});
