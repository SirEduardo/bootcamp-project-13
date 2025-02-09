import { useForm } from "react-hook-form";
import { CalendarIcon, ClockIcon, UsersIcon } from "lucide-react";
import { Header } from "../../Header/Header";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../../utils/Functions/api/api";
import useFetch from "../../../utils/Hooks/fetch";
import Loading from "../../Loading/Loading";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../utils/Hooks/useReducer";

const CreateReservation = () => {
  const { id } = useParams();
  const { state, dispatch } = useContext(GlobalContext);
  const { loading, error, restaurant } = state;
  const { fetchData, postData } = useFetch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");
    if (!token) {
      dispatch({
        type: "SET_ERROR",
        payload: "Debes estar logeado para hacer una reserva.",
      });
      return;
    }

    const formData = {
      user: userId,
      restaurant: id,
      booking_date: data.booking,
      time: data.time,
      n_persons: data.n_persons,
    };
    const response = await postData(`${API_URL}/reservations/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Reserva realizada con éxito:", response);
    navigate("/myReservations");
  };
  const fetchRestaurant = async () => {
    const response = await fetchData(`${API_URL}/restaurants/${id}`);
    dispatch({ type: "SET_RESTAURANT", payload: response });
  };
  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const isTimeValid = (time) => {
    if (!restaurant) return true;
    const [selectedHour, selectedMinute] = time.split(":").map(Number);
    const openingHour = parseInt(restaurant.opening);
    const closingHour = parseInt(restaurant.closing);

    return (
      (selectedHour > openingHour && selectedHour < closingHour) ||
      (selectedHour === openingHour && selectedMinute >= 0) ||
      (selectedHour === closingHour && selectedMinute === 0)
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };
  return (
    <div>
      <Header />
      <div className="max-w-md mx-auto mt-32 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white">Reserva tu mesa</h1>
          <p className="text-white text-opacity-80">
            Rellena el formulario para hacer tu reserva
          </p>
        </div>
        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="booking"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de la reserva
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("booking", {
                  required: true,
                  message: "Ingrese la fecha porfavor",
                })}
                id="booking"
                min={getTodayDate()}
                className={`w-full p-2 pr-10 border ${
                  errors.booking ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-2 ${
                  errors.booking ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.booking && (
              <span className="mt-1 text-sm text-red-600">
                {errors.booking.message}
              </span>
            )}
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora de la reserva
            </label>
            <div className="relative">
              <input
                type="time"
                {...register("time", {
                  required: true,
                  message: "Ingrese la hora porfavor",
                  validate: {
                    validTime: (value) => isTimeValid(value) || "Local cerrado",
                  },
                })}
                id="time"
                className={`w-full p-2 pr-10 border ${
                  errors.time ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-2 ${
                  errors.time ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p>
              Horario: {restaurant?.opening}-{restaurant?.closing}
            </p>
            {errors.time && (
              <span className="mt-1 text-sm text-red-600">
                {errors.time.message}
              </span>
            )}
          </div>
          <div>
            <label
              htmlFor="n_persons"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Numero de personas
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("n_persons", {
                  required: true,
                  message: "Ingrese el Nº de personas",
                })}
                id="n_persons"
                className={`w-full p-2 pr-10 border ${
                  errors.n_persons ? "border-red-500" : "border-gray-300"
                } rounded-md focus:ring-2 ${
                  errors.n_persons
                    ? "focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              <UsersIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {errors.n_persons && (
              <span className="mt-1 text-sm text-red-600"></span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {loading ? (
              <Loading color="text-white" message="Cargando..." />
            ) : (
              "Enviar"
            )}
          </button>
          {error && (
            <div className="mt-4">
              <span className="text-red-600">{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default CreateReservation;
