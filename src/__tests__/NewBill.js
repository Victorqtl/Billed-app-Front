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
          store: mockStore,
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
          store: mockStore,
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
          store: mockStore,
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

// Test d'intégration 

// describe("Given I am a user connected as Employee", () => {
//   describe("When I navigate to NewBill", () => {
//     test("Then I can create a new bill", async () => {
//       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.NewBill)

//       const newBill = new NewBill({
//         document, onNavigate, store: mockStore, localStorage: window.localStorage
//       })

//       const form = screen.getByTestId("form-new-bill")
//       const handleSubmit = jest.fn(newBill.handleSubmit)
//       form.addEventListener("submit", handleSubmit)

//       fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
//       fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris-Londres" } })
//       fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-07-15" } })
//       fireEvent.change(screen.getByTestId("amount"), { target: { value: "200" } })
//       fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } })
//       fireEvent.change(screen.getByTestId("pct"), { target: { value: "10" } })
//       fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Voyage d'affaires" } })

//       const file = new File(['test'], 'test.png', { type: 'image/png' })
//       const inputFile = screen.getByTestId("file")
//       Object.defineProperty(inputFile, 'files', {
//         value: [file]
//       })
//       fireEvent.change(inputFile)

//       fireEvent.submit(form)

//       expect(handleSubmit).toHaveBeenCalled()
//       expect(mockStore.bills).toHaveBeenCalled()
//       expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
//     })
//   })

//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills")
//       Object.defineProperty(
//         window,
//         'localStorage',
//         { value: localStorageMock }
//       )
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee',
//         email: "e@e"
//       }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.appendChild(root)
//       router()
//     })

//     test("Then it fails with 404 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           create : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }
//       })
//       window.onNavigate(ROUTES_PATH.NewBill)
//       await new Promise(process.nextTick)
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })

//     test("Then it fails with 500 message error", async () => {
//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           create : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           }
//         }
//       })
//       window.onNavigate(ROUTES_PATH.NewBill)
//       await new Promise(process.nextTick)
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })
// })