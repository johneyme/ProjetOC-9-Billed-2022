/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on the New Bill button", () => {
    test("The new bill page must to be appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ data: bills });

      const getBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const newBillBtn = screen.getByTestId("btn-new-bill");
      const handleClickNewBillButton = jest.fn(getBills.handleClickNewBill());
      newBillBtn.addEventListener("click", handleClickNewBillButton);
      fireEvent.click(newBillBtn);
      expect(handleClickNewBillButton).toHaveBeenCalled();
      const newBillPageTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillPageTitle).toBeTruthy();
    });
  });

  describe("When I click on the eye icon", () => {
    test("The modal must to be appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ data: bills });

      const getBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      const eyeIconBtn = screen.getAllByTestId("icon-eye");
      const handleClickEyeIcon = jest.fn(
        getBills.handleClickIconEye(eyeIconBtn[0])
      );
      eyeIconBtn[0].addEventListener("click", handleClickEyeIcon);
      fireEvent.click(eyeIconBtn[0]);
      expect(handleClickEyeIcon).toHaveBeenCalled();
      const modalOpen = screen.getByTestId("modale-file");
      expect(modalOpen).toBeTruthy();
    });
  });
});
