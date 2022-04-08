import { mount, flushPromises } from "@vue/test-utils";
import Scorecard from "@/components/Scorecard.vue";

jest.mock("@/services/Functional/Utilities.ts", () => ({
  __esModule: true,
  throwConfetti: jest.fn(),
  isScreenPortrait: jest.fn(),
}));

/**
 * we are only declaring the mock for window.open here instead of defining it too;
 * this is because we will destroy it after each test and recreate it before each;
 */
let mockWindowOpen: any;

beforeEach(() => {
  jest.useFakeTimers();
  mockWindowOpen = jest.fn().mockImplementation(() => ({
    focus: jest.fn(),
  }));
  Object.defineProperty(window, "open", {
    writable: true,
    value: mockWindowOpen,
  });
});

afterEach(() => {
  // required otherwise the calls to window.open get stacked
  mockWindowOpen.mockRestore();
});

describe("Scorecard.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(Scorecard);
    expect(wrapper).toBeTruthy();
  });

  it("should adjust the radius/stroke of the progress bar according to screen size and orientation", async () => {
    const wrapper = mount(Scorecard);

    expect(wrapper.vm.circularProgressRadius).toBe(120);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    wrapper.vm.innerWidth = 1300;
    expect(wrapper.vm.circularProgressRadius).toBe(130);
    expect(wrapper.vm.circularProgressStroke).toBe(20);

    wrapper.vm.innerWidth = 800;
    expect(wrapper.vm.circularProgressRadius).toBe(110);
    expect(wrapper.vm.circularProgressStroke).toBe(18);

    wrapper.vm.innerWidth = 700;
    expect(wrapper.vm.circularProgressRadius).toBe(90);
    expect(wrapper.vm.circularProgressStroke).toBe(14);

    wrapper.vm.innerWidth = 500;
    expect(wrapper.vm.circularProgressRadius).toBe(80);
    expect(wrapper.vm.circularProgressStroke).toBe(12);
  });

  it("should emit a signal when watch again is clicked", async () => {
    const wrapper = mount(Scorecard);

    await wrapper.find('[data-test="watchAgainButton"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("restart-quiz");
  });

  it("triggers sharing text on whatsapp upon clicking share button", async () => {
    const wrapper = mount(Scorecard);
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it("should show/hide the scorecard popup using isShown prop", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard, {
      props: {
        progressPercentage: progressPercentage,
      },
    });

    await wrapper.setProps({
      isShown: true,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercentage).toBe(progressPercentage);

    await wrapper.setProps({
      isShown: false,
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    expect(wrapper.vm.localProgressBarPercentage).toBe(0);
  });

  it("share text on whatsapp when no questions answered", async () => {
    const wrapper = mount(Scorecard);
    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*undefined*%20%F0%9F%8C%9F%0A%0AI%20answered%20undefined%20questions%20with%200%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A"
    );
  });

  it("share text on whatsapp when one question answered", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard);
    await wrapper.setProps({
      numQuestionsAnswered: 4,
      progressPercentage: progressPercentage,
      isShown: true,
      title: "Geometry Quiz",
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*Geometry%20Quiz*%20%F0%9F%8C%9F%0A%0AI%20answered%204%20questions%20with%2050%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });

  it("share text on whatsapp when multiple questions answered", async () => {
    const progressPercentage = 50;
    const wrapper = mount(Scorecard);
    await wrapper.setProps({
      numQuestionsAnswered: 4,
      progressPercentage: progressPercentage,
      isShown: true,
      title: "Geometry Quiz",
    });
    await flushPromises();
    await jest.advanceTimersByTime(1000);

    await wrapper.find('[data-test="share"]').trigger("click");

    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://api.whatsapp.com/send/?phone&text=%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%0A%0A%F0%9F%8F%86%20*Hooray!%20I%20completed%20a%20Quiz!*%20%F0%9F%8F%86%0A%0A%F0%9F%8C%9F%20*Geometry%20Quiz*%20%F0%9F%8C%9F%0A%0AI%20answered%204%20questions%20with%2050%25%20accuracy%20on%20Avanti%20Fellows%20quiz%20today!%20%F0%9F%98%87%0A%0A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A%F0%9F%8E%89%F0%9F%8E%8A`
    );
  });
});
