/**
 * @jest-environment jsdom
 */

import { getByTestId, screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"

const mockedStore = {
  bills: jest.fn(() => ({
    create: jest.fn(() => Promise.resolve({})),
    update: jest.fn(() => Promise.resolve({}))
  }))
}

describe("Given I am connected as an employee", () => {
  describe("When I am Newbill Page", () => {
    describe("When I upload a file", () => {
      test("Then it should accept an image file", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'employee@test.tld'
        }))
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage
        })
        const file = new File(["image"], "image.png", { type: "image/png" })
        const inputFile = screen.getByTestId("file")
        Object.defineProperty(inputFile, "files", {
          value: [file]
        })
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        inputFile.addEventListener("change", handleChangeFile)
        inputFile.dispatchEvent(new Event("change"))
        expect(handleChangeFile).toHaveBeenCalled
        expect(inputFile.files[0]).toEqual(file)
        expect(inputFile.files[0].name).toBe("image.png")
      })

      test("Then it should reject a non-image file", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'employee@test.tld'
        }))
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage
        })
        const file = new File(["document"], "document.pdf", { type: "document/pdf" })
        const inputFile = screen.getByTestId("file")
        Object.defineProperty(inputFile, "files", {
          value: [file]
        })
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        inputFile.addEventListener("change", handleChangeFile)
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        inputFile.dispatchEvent(new Event("change"))
        expect(window.alert).toHaveBeenCalledWith("Please choose an image file!")
        expect(inputFile.value).toBe("")
      })
    })

    describe("When I validate the form", () => {
      test("The form is valid", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = jest.fn()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'employee@test.tld'
        }))
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage
        })
        screen.getByTestId("expense-type").value = "Transports"
        screen.getByTestId("expense-name").value = "Vol Paris-Londres"
        screen.getByTestId("amount").value = "100"
        screen.getByTestId("datepicker").value = "2023-04-15"
        screen.getByTestId("vat").value = "20"
        screen.getByTestId("pct").value = "10"
        screen.getByTestId("commentary").value = "Voyage d'affaires"
        newBill.fileName = "facture.jpg"
        newBill.fileUrl = "https://example.com/facture.jpg"
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", newBill.handleSubmit)
        fireEvent.submit(form)
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      })
    })
  })
})