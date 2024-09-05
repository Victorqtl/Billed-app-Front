/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router.js"
import mockStore from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am Newbill Page", () => {
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      }))
    })

    test("When I upload a file, then it should accept an image file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const file = new File(["image"], "image.png", { type: "image/png" })
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputFile, { target: { files: [file] } })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)

      inputFile.addEventListener("change", handleChangeFile)
      inputFile.dispatchEvent(new Event("change"))

      expect(handleChangeFile).toHaveBeenCalled
      expect(inputFile.files[0]).toEqual(file)
      expect(inputFile.files[0].name).toBe("image.png")
    })

    test("Then it should reject a non-image file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const file = new File(["document"], "document.pdf", { type: "document/pdf" })
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputFile, { target: { files: [file] } })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)

      inputFile.addEventListener("change", handleChangeFile)
      jest.spyOn(window, 'alert').mockImplementation(() => { })
      inputFile.dispatchEvent(new Event("change"))

      expect(window.alert).toHaveBeenCalledWith("Please choose an image file!")
      expect(inputFile.value).toBe("")
    })

    test("When I validate the form, the form is valid", () => {
      const onNavigate = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Londres" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-07-15" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "200" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "10" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Voyage d'affaires" } })
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } })

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
    })
  })
})

