/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);
window.alert = jest.fn();

describe("Given I am connected as an employee on NewBill page", () => {
  describe("When I am on NewBill page", () => {
    test("Then it should render the page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const newBillTitle = screen.getByText("Envoyer une note de frais");
      expect(newBillTitle).toBeTruthy();
    });
  });

  describe("When required fields are empty and I click on 'Send'", () => {
    test("Then I am still on NewBill page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const dateInput = screen.getByTestId("datepicker");
      expect(dateInput.innerHTML).toBe("");
      const amountInput = screen.getByTestId("amount");
      expect(amountInput.innerHTML).toBe("");
      const pctInput = screen.getByTestId("pct");
      expect(pctInput.innerHTML).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled();
    });
  });

  describe("When the required inputs are filled and I click on 'Send'", () => {
    test("Then the form is submitted and I go back on Bills page", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const newCreatedBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const newBillInputData = {
        date: "2021-12-31",
        amount: "123",
        pct: "25",
        file: new File(["img"], "test_newbill.png", { type: "image/png" }),
      };

      const dateInputNewBill = screen.getByTestId("datepicker");
      fireEvent.change(dateInputNewBill, {
        target: { value: newBillInputData.date },
      });
      expect(dateInputNewBill.value).toBe(newBillInputData.date);

      const amountInputNewBill = screen.getByTestId("amount");
      fireEvent.change(amountInputNewBill, {
        target: { value: newBillInputData.amount },
      });
      expect(amountInputNewBill.value).toBe(newBillInputData.amount);

      const pctInputNewBill = screen.getByTestId("pct");
      fireEvent.change(pctInputNewBill, {
        target: { value: newBillInputData.pct },
      });
      expect(pctInputNewBill.value).toBe(newBillInputData.pct);

      const fileChangeNewBill = screen.getByTestId("file");
      const handleChangeFileButton = jest.fn((e) =>
        newCreatedBill.handleChangeFile(e)
      );
      fileChangeNewBill.addEventListener("change", handleChangeFileButton);
      userEvent.upload(fileChangeNewBill, newBillInputData.file);
      expect(handleChangeFileButton).toHaveBeenCalled();
      expect(fileChangeNewBill.files[0]).toBe(newBillInputData.file);
      expect(fileChangeNewBill.files.item(0)).toBe(newBillInputData.file);
      expect(fileChangeNewBill.files).toHaveLength(1);

      const form = screen.getByTestId("form-new-bill");
      const handleSubmitNewBill = jest.fn((e) =>
        newCreatedBill.handleSubmit(e)
      );
      form.addEventListener("submit", handleSubmitNewBill);
      fireEvent.submit(form);
      expect(handleSubmitNewBill).toHaveBeenCalled();

      await new Promise(process.nextTick);
      const billsTitle = screen.getByText("Mes notes de frais");
      expect(billsTitle).toBeTruthy();
      const billsTableBody = screen.getByTestId("tbody");
      expect(billsTableBody).toBeTruthy();
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bill page", () => {
    test("fetches New Bills from mock API", async () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
      });
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH["Bills"]);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH["Bills"]);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
