/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import mockedBills from "../__mocks__/store.js"

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
      document.body.innerHTML = BillsUI({ data: bills })
      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      eyeIcon.addEventListener('click', billsInstance.handleClickIconEye(eyeIcon))
      eyeIcon.click()
      const modal = document.getElementById('modaleFile')
      expect(modal.classList.contains('show')).toBe(true)
      expect(modal.style.display).toBe('block')
    })
  })

  describe("when I click on the New Bill button", () => {
    test("Then I should be redirected to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = jest.fn()
      const billsInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', billsInstance.handleClickNewBill)
      newBillButton.click()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })
})