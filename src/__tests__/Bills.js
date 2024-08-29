/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import mockedBills from "../__mocks__/store.js"

// Import du mock Undefined
// import mockStore from "../__mocks__/store.js"
// jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => (new Date(b) - new Date(a))
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then it should fetch bills from the store", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const billsInstance = new Bills({
        document, onNavigate: jest.fn(), store: mockedBills, localStorage: window.localStorage
      })
      const listSpy = jest.spyOn(mockedBills.bills(), 'list')
      await billsInstance.getBills()
      expect(listSpy).toBeCalled()
    })
  })

  describe("When I click on the eye icon", () => {
    test("Then a modal should open with the bill image", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      eyeIcon.addEventListener('click', billsInstance.handleClickIconEye(eyeIcon))
      fireEvent.click(eyeIcon)
      const modal = document.getElementById('modaleFile')
      expect(modal.classList.contains('show')).toBe(true)
      expect(modal.style.display).toBe('block')
    })
  })

  describe("when I click on the New Bill button", () => {
    test("Then I should be redirected to NewBill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = jest.fn()
      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', billsInstance.handleClickNewBill)
      fireEvent.click(newBillButton)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })

})

// Test d'intégration GET

// describe("Given I am a user connected as Employee", () => {
//   describe("When I navigate to Bills", () => {
//     test("fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Bills)
//       await waitFor(() => screen.getByText("Mes notes de frais"))
//       const contentPending  = await screen.getByText("En attente")
//       expect(contentPending).toBeTruthy()
//       const contentRefused  = await screen.getByText("Refused")
//       expect(contentRefused).toBeTruthy()
//     })
//   })
//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockedBills, "bills")
//       Object.defineProperty(
//           window,
//           'localStorage',
//           { value: localStorageMock }
//       )
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee',
//         email: "a@a"
//       }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.appendChild(root)
//       router()
//     })
//     test("fetches bills from an API and fails with 404 message error", async () => {

//       mockedBills.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }})
//       window.onNavigate(ROUTES_PATH.Bills)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })

//     test("fetches messages from an API and fails with 500 message error", async () => {

//       mockedBills.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           }
//         }})

//       window.onNavigate(ROUTES_PATH.Bills)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })

// })